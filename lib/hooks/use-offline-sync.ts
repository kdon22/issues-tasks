// Offline Sync Utilities - Background Sync & Conflict Resolution
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

interface SyncItem {
  id: string;
  type: 'create' | 'update' | 'delete';
  resource: string;
  data: any;
  timestamp: number;
  retries: number;
  priority: 'high' | 'medium' | 'low';
}

interface SyncState {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  lastSync: Date | null;
  errors: string[];
}

interface ConflictResolution {
  strategy: 'client-wins' | 'server-wins' | 'merge' | 'manual';
  resolver?: (client: any, server: any) => any;
}

// IndexedDB for offline storage
class OfflineSyncStorage {
  private dbName = 'issuestasks-sync';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Sync queue store
        if (!db.objectStoreNames.contains('syncQueue')) {
          const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id' });
          syncStore.createIndex('timestamp', 'timestamp');
          syncStore.createIndex('priority', 'priority');
          syncStore.createIndex('resource', 'resource');
        }
        
        // Conflict store
        if (!db.objectStoreNames.contains('conflicts')) {
          const conflictStore = db.createObjectStore('conflicts', { keyPath: 'id' });
          conflictStore.createIndex('resource', 'resource');
          conflictStore.createIndex('timestamp', 'timestamp');
        }
        
        // Metadata store
        if (!db.objectStoreNames.contains('metadata')) {
          db.createObjectStore('metadata', { keyPath: 'key' });
        }
      };
    });
  }

  async addToSyncQueue(item: SyncItem): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['syncQueue'], 'readwrite');
      const store = transaction.objectStore('syncQueue');
      const request = store.put(item);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getSyncQueue(): Promise<SyncItem[]> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['syncQueue'], 'readonly');
      const store = transaction.objectStore('syncQueue');
      const index = store.index('priority');
      const request = index.getAll();
      
      request.onsuccess = () => {
        const items = request.result || [];
        // Sort by priority: high, medium, low, then by timestamp
        items.sort((a, b) => {
          const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
          if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
            return priorityOrder[a.priority] - priorityOrder[b.priority];
          }
          return a.timestamp - b.timestamp;
        });
        resolve(items);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async removeFromSyncQueue(id: string): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['syncQueue'], 'readwrite');
      const store = transaction.objectStore('syncQueue');
      const request = store.delete(id);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async addConflict(conflict: any): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['conflicts'], 'readwrite');
      const store = transaction.objectStore('conflicts');
      const request = store.put(conflict);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getConflicts(): Promise<any[]> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['conflicts'], 'readonly');
      const store = transaction.objectStore('conflicts');
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async setMetadata(key: string, value: any): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['metadata'], 'readwrite');
      const store = transaction.objectStore('metadata');
      const request = store.put({ key, value, timestamp: Date.now() });
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getMetadata(key: string): Promise<any> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['metadata'], 'readonly');
      const store = transaction.objectStore('metadata');
      const request = store.get(key);
      
      request.onsuccess = () => resolve(request.result?.value);
      request.onerror = () => reject(request.error);
    });
  }
}

// Singleton instance
const syncStorage = new OfflineSyncStorage();

// Background sync manager
class BackgroundSyncManager {
  private isProcessing = false;
  private retryTimeouts = new Map<string, NodeJS.Timeout>();
  private maxRetries = 3;
  private retryDelays = [1000, 5000, 15000]; // 1s, 5s, 15s

  async processSyncQueue(): Promise<void> {
    if (this.isProcessing || !navigator.onLine) return;

    this.isProcessing = true;
    
    try {
      const queue = await syncStorage.getSyncQueue();
      
      for (const item of queue) {
        if (item.retries >= this.maxRetries) {
          await syncStorage.removeFromSyncQueue(item.id);
          continue;
        }

        try {
          await this.syncItem(item);
          await syncStorage.removeFromSyncQueue(item.id);
        } catch (error) {
          console.error('Sync failed for item:', item.id, error);
          
          // Retry with exponential backoff
          const delay = this.retryDelays[item.retries] || 30000;
          const updatedItem = { ...item, retries: item.retries + 1 };
          
          await syncStorage.addToSyncQueue(updatedItem);
          
          // Schedule retry
          this.retryTimeouts.set(item.id, setTimeout(() => {
            this.retryTimeouts.delete(item.id);
            this.processSyncQueue();
          }, delay));
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }

  private async syncItem(item: SyncItem): Promise<void> {
    const { type, resource, data, id } = item;
    
    const url = type === 'create' 
      ? `/api/${resource}`
      : `/api/${resource}/${data.id || id}`;
    
    const method = type === 'create' ? 'POST' : 
                  type === 'update' ? 'PUT' : 'DELETE';
    
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: type !== 'delete' ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      if (response.status === 409) {
        // Conflict - handle it
        const serverData = await response.json();
        await this.handleConflict(item, serverData);
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    }
  }

  private async handleConflict(item: SyncItem, serverData: any): Promise<void> {
    const conflict = {
      id: `conflict_${Date.now()}_${Math.random()}`,
      resource: item.resource,
      clientData: item.data,
      serverData,
      timestamp: Date.now(),
      resolved: false
    };

    await syncStorage.addConflict(conflict);
    
    // Notify user about conflict
    toast.error('Data conflict detected. Please review and resolve.');
  }

  start(): void {
    // Process queue immediately
    this.processSyncQueue();
    
    // Set up periodic sync
    const intervalId = setInterval(() => {
      this.processSyncQueue();
    }, 30000); // Every 30 seconds
    
    // Sync when coming back online
    window.addEventListener('online', () => {
      this.processSyncQueue();
    });
  }

  stop(): void {
    this.retryTimeouts.forEach(timeout => clearTimeout(timeout));
    this.retryTimeouts.clear();
  }
}

// Singleton instance
const backgroundSync = new BackgroundSyncManager();

// Main offline sync hook
export function useOfflineSync(options: {
  autoStart?: boolean;
  conflictResolution?: ConflictResolution;
} = {}) {
  const { autoStart = true, conflictResolution } = options;
  
  const [state, setState] = useState<SyncState>({
    isOnline: navigator.onLine,
    isSyncing: false,
    pendingCount: 0,
    lastSync: null,
    errors: []
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const conflictResolutionRef = useRef(conflictResolution);

  // Update conflict resolution
  useEffect(() => {
    conflictResolutionRef.current = conflictResolution;
  }, [conflictResolution]);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => {
      setState(prev => ({ ...prev, isOnline: true }));
      if (autoStart) {
        backgroundSync.processSyncQueue();
      }
    };
    
    const handleOffline = () => {
      setState(prev => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [autoStart]);

  // Update pending count periodically
  useEffect(() => {
    const updatePendingCount = async () => {
      try {
        const queue = await syncStorage.getSyncQueue();
        const conflicts = await syncStorage.getConflicts();
        setState(prev => ({
          ...prev,
          pendingCount: queue.length,
          errors: conflicts.filter(c => !c.resolved).map(c => `Conflict in ${c.resource}`)
        }));
      } catch (error) {
        console.error('Failed to update pending count:', error);
      }
    };

    updatePendingCount();
    intervalRef.current = setInterval(updatePendingCount, 5000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Start background sync
  useEffect(() => {
    if (autoStart) {
      backgroundSync.start();
    }

    return () => {
      if (autoStart) {
        backgroundSync.stop();
      }
    };
  }, [autoStart]);

  // Queue operation for sync
  const queueOperation = useCallback(async (
    type: 'create' | 'update' | 'delete',
    resource: string,
    data: any,
    priority: 'high' | 'medium' | 'low' = 'medium'
  ) => {
    const item: SyncItem = {
      id: `${type}_${resource}_${Date.now()}_${Math.random()}`,
      type,
      resource,
      data,
      timestamp: Date.now(),
      retries: 0,
      priority
    };

    await syncStorage.addToSyncQueue(item);
    
    // Try to sync immediately if online
    if (navigator.onLine) {
      backgroundSync.processSyncQueue();
    }
  }, []);

  // Force sync now
  const syncNow = useCallback(async (options: { showToast?: boolean } = {}) => {
    if (!navigator.onLine) {
      toast.error('Cannot sync while offline');
      return;
    }

    const { showToast = true } = options; // Default to true for manual sync calls

    setState(prev => ({ ...prev, isSyncing: true }));
    
    try {
      await backgroundSync.processSyncQueue();
      setState(prev => ({ 
        ...prev, 
        isSyncing: false, 
        lastSync: new Date() 
      }));
      
      // Only show success toast if explicitly requested
      if (showToast) {
  
      }
    } catch (error) {
      setState(prev => ({ ...prev, isSyncing: false }));
      toast.error('Sync failed. Will retry automatically.');
    }
  }, []);

  // Resolve conflict
  const resolveConflict = useCallback(async (
    conflictId: string,
    resolution: 'client' | 'server' | 'merged',
    mergedData?: any
  ) => {
    // Implementation depends on your conflict resolution strategy
    // This would typically update the conflict record and potentially
    // queue a new sync operation
    console.log('Resolving conflict:', conflictId, resolution, mergedData);
    
    // For now, just mark as resolved
    // In a real implementation, you'd update the conflict record
    // and potentially queue a new sync operation
  }, []);

  // Get conflicts
  const getConflicts = useCallback(async () => {
    return await syncStorage.getConflicts();
  }, []);

  return {
    ...state,
    queueOperation,
    syncNow,
    resolveConflict,
    getConflicts
  };
}

// Hook for specific resource sync
export function useResourceSync(resource: string) {
  const { queueOperation, ...syncState } = useOfflineSync();

  const queueCreate = useCallback((data: any, priority?: 'high' | 'medium' | 'low') => {
    return queueOperation('create', resource, data, priority);
  }, [queueOperation, resource]);

  const queueUpdate = useCallback((data: any, priority?: 'high' | 'medium' | 'low') => {
    return queueOperation('update', resource, data, priority);
  }, [queueOperation, resource]);

  const queueDelete = useCallback((id: string, priority?: 'high' | 'medium' | 'low') => {
    return queueOperation('delete', resource, { id }, priority);
  }, [queueOperation, resource]);

  return {
    ...syncState,
    queueCreate,
    queueUpdate,
    queueDelete
  };
}

// Export types for use in components
export type { SyncState, SyncItem, ConflictResolution }; 