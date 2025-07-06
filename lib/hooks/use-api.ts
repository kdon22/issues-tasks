// useApi Hook - Offline-First API Management (Lightning Fast Fixed ⚡️)
import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  isOnline: boolean;
  lastSync: Date | null;
}

interface ApiOptions {
  cacheKey?: string;
  timeout?: number;
  retries?: number;
  optimistic?: boolean;
  showToasts?: boolean;
  fallbackData?: any;
}

interface PendingOperation {
  id: string;
  method: string;
  url: string;
  data?: any;
  timestamp: number;
  retries: number;
}

// IndexedDB wrapper for offline storage
class OfflineStorage {
  private dbName = 'linear-clone-offline';
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
        
        // Cache store
        if (!db.objectStoreNames.contains('cache')) {
          const cacheStore = db.createObjectStore('cache', { keyPath: 'key' });
          cacheStore.createIndex('timestamp', 'timestamp');
        }
        
        // Pending operations store
        if (!db.objectStoreNames.contains('pending')) {
          const pendingStore = db.createObjectStore('pending', { keyPath: 'id' });
          pendingStore.createIndex('timestamp', 'timestamp');
        }
      };
    });
  }

  async get(key: string): Promise<any> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cache'], 'readonly');
      const store = transaction.objectStore('cache');
      const request = store.get(key);
      
      request.onsuccess = () => {
        const result = request.result;
        if (result && Date.now() - result.timestamp < 5 * 60 * 1000) { // 5 min cache
          resolve(result.data);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async set(key: string, data: any): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      const request = store.put({
        key,
        data,
        timestamp: Date.now()
      });
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async addPendingOperation(operation: PendingOperation): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['pending'], 'readwrite');
      const store = transaction.objectStore('pending');
      const request = store.put(operation);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getPendingOperations(): Promise<PendingOperation[]> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['pending'], 'readonly');
      const store = transaction.objectStore('pending');
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async removePendingOperation(id: string): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['pending'], 'readwrite');
      const store = transaction.objectStore('pending');
      const request = store.delete(id);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

// Singleton instance
const storage = new OfflineStorage();

export function useApi<T = any>(url?: string, options: ApiOptions = {}) {
  const {
    cacheKey = url,
    timeout = 10000,
    retries = 3,
    optimistic = true,
    showToasts = true,
    fallbackData = null
  } = options;

  const [state, setState] = useState<ApiState<T>>({
    data: fallbackData,
    loading: false,
    error: null,
    isOnline: navigator.onLine,
    lastSync: null
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const syncQueueRef = useRef<Set<string>>(new Set());

  // Sync pending operations when online
  const syncPendingOperations = useCallback(async () => {
    if (!navigator.onLine) return;

    try {
      const pendingOps = await storage.getPendingOperations();
      
      for (const op of pendingOps) {
        if (syncQueueRef.current.has(op.id)) continue;
        syncQueueRef.current.add(op.id);

        try {
          const response = await fetch(op.url, {
            method: op.method,
            credentials: 'include', // Include cookies for authentication
            headers: { 'Content-Type': 'application/json' },
            body: op.data ? JSON.stringify(op.data) : undefined,
            signal: AbortSignal.timeout(timeout)
          });

          if (response.ok) {
            await storage.removePendingOperation(op.id);
            if (showToasts) {
              toast.success('Changes synced successfully');
            }
          } else {
            throw new Error(`HTTP ${response.status}`);
          }
        } catch (error) {
          console.error('Sync failed for operation:', op.id, error);
          if (op.retries > 0) {
            // Retry later
            await storage.addPendingOperation({
              ...op,
              retries: op.retries - 1,
              timestamp: Date.now()
            });
          } else {
            await storage.removePendingOperation(op.id);
            if (showToasts) {
              toast.error('Failed to sync some changes');
            }
          }
        } finally {
          syncQueueRef.current.delete(op.id);
        }
      }
    } catch (error) {
      console.error('Sync process failed:', error);
    }
  }, [timeout, showToasts]);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => {
      setState(prev => ({ ...prev, isOnline: true }));
      syncPendingOperations();
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
  }, [syncPendingOperations]);

  // Generic API call function
  const apiCall = useCallback(async (
    endpoint: string,
    options: RequestInit = {},
    optimisticData?: T
  ): Promise<T> => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;

    setState(prev => ({ 
      ...prev, 
      loading: true, 
      error: null,
      ...(optimisticData && optimistic ? { data: optimisticData } : {})
    }));

    try {
      // Try cache first for GET requests
      if (!options.method || options.method === 'GET') {
        const cached = await storage.get(cacheKey || endpoint);
        if (cached && !navigator.onLine) {
          setState(prev => ({ 
            ...prev, 
            data: cached, 
            loading: false,
            lastSync: new Date(cached.timestamp || Date.now())
          }));
          return cached;
        }
      }

      // If offline and not a GET request, queue for later
      if (!navigator.onLine && options.method && options.method !== 'GET') {
        const operation: PendingOperation = {
          id: `${Date.now()}-${Math.random()}`,
          method: options.method,
          url: endpoint,
          data: options.body ? JSON.parse(options.body as string) : undefined,
          timestamp: Date.now(),
          retries: retries
        };

        await storage.addPendingOperation(operation);
        
        if (showToasts) {
          toast.info('Changes saved locally. Will sync when online.');
        }

        setState(prev => ({ ...prev, loading: false }));
        return optimisticData!;
      }

      // Make the API call
      const response = await fetch(endpoint, {
        ...options,
        signal,
        credentials: 'include', // Include cookies for authentication
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const result = data; // Return the full response object

      // Cache successful GET requests
      if (!options.method || options.method === 'GET') {
        await storage.set(cacheKey || endpoint, result);
      }

      setState(prev => ({ 
        ...prev, 
        data: result, 
        loading: false,
        lastSync: new Date()
      }));

      return result;

    } catch (error: any) {
      if (error.name === 'AbortError') {
        return state.data!;
      }

      console.error('API call failed:', error);
      
      // Try cache on error
      if (!options.method || options.method === 'GET') {
        const cached = await storage.get(cacheKey || endpoint);
        if (cached) {
          setState(prev => ({ 
            ...prev, 
            data: cached, 
            loading: false,
            error: 'Using cached data'
          }));
          return cached;
        }
      }

      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.message,
        ...(fallbackData ? { data: fallbackData } : {})
      }));

      if (showToasts) {
        toast.error(`Failed to ${options.method || 'fetch'}: ${error.message}`);
      }

      throw error;
    }
  }, [cacheKey, retries, optimistic, showToasts, timeout, fallbackData]);

  // Convenience methods
  const get = useCallback((endpoint: string) => 
    apiCall(endpoint, { method: 'GET' }), [apiCall]);

  const post = useCallback((endpoint: string, data?: any, optimisticData?: T) => 
    apiCall(endpoint, { 
      method: 'POST', 
      body: data ? JSON.stringify(data) : undefined 
    }, optimisticData), [apiCall]);

  const put = useCallback((endpoint: string, data?: any, optimisticData?: T) => 
    apiCall(endpoint, { 
      method: 'PUT', 
      body: data ? JSON.stringify(data) : undefined 
    }, optimisticData), [apiCall]);

  const del = useCallback((endpoint: string, optimisticData?: T) => 
    apiCall(endpoint, { method: 'DELETE' }, optimisticData), [apiCall]);

  // Auto-fetch on mount if URL provided (only once)
  const hasFetchedRef = useRef(false);
  useEffect(() => {
    if (url && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      get(url).catch(() => {}); // Errors handled in apiCall
    }
  }, [url, get]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    ...state,
    get,
    post,
    put,
    delete: del,
    refetch: url ? () => get(url) : undefined,
    syncPending: syncPendingOperations
  };
} 