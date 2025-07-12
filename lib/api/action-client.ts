import { z } from 'zod';
import { 
  Team, 
  Project, 
  Label, 
  Member, 
  IssueType, 
  State, 
  StatusFlow, 
  FieldSet, 
  Issue, 
  Comment, 
  Reaction 
} from '@/lib/types';

// Static resource configuration to avoid circular dependencies
const STATIC_RESOURCES = [
  { actionPrefix: 'team', name: 'Team' },
  { actionPrefix: 'project', name: 'Project' },
  { actionPrefix: 'label', name: 'Label' },
  { actionPrefix: 'labelGroup', name: 'Label Group' },
  { actionPrefix: 'member', name: 'Member' },
  { actionPrefix: 'issueType', name: 'Issue Type' },
  { actionPrefix: 'state', name: 'State' },
  { actionPrefix: 'statusFlow', name: 'Status Flow' },
  { actionPrefix: 'fieldSet', name: 'Field Set' },
  { actionPrefix: 'issue', name: 'Issue' },
  { actionPrefix: 'comment', name: 'Comment' },
  { actionPrefix: 'reaction', name: 'Reaction' }
];

// Action request interface
export interface ActionRequest {
  action: string;
  resourceType?: string;
  resourceId?: string;
  parentId?: string;
  data?: Record<string, any>;
  options?: {
    include?: string[];
    optimistic?: boolean;
    skipCache?: boolean;
  };
}

// Action response interface
export interface ActionResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  optimisticId?: string;
  timestamp: number;
  action: string;
}

// Resource type mapping for TypeScript types
const RESOURCE_TYPE_MAP = {
  'team': 'Team',
  'project': 'Project',
  'label': 'Label',
  'member': 'Member',
  'issueType': 'IssueType',
  'state': 'State',
  'statusFlow': 'StatusFlow',
  'fieldSet': 'FieldSet',
  'issue': 'Issue',
  'comment': 'Comment',
  'reaction': 'Reaction'
} as const;

// Use static resources to avoid circular dependencies
const AVAILABLE_RESOURCES = STATIC_RESOURCES.map(resource => ({
  actionPrefix: resource.actionPrefix,
  name: resource.name,
  storeName: resource.actionPrefix + 's' // pluralize for storage
}));

console.log('🔍 ActionClient - Discovered resources:', AVAILABLE_RESOURCES);

// Create plural mappings for IndexedDB stores
const STORE_MAPPINGS = AVAILABLE_RESOURCES.reduce((acc, resource) => {
  acc[resource.actionPrefix] = resource.storeName;
  return acc;
}, {} as Record<string, string>);

console.log('🗺️ ActionClient - Store mappings:', STORE_MAPPINGS);

// IndexedDB schema for offline storage - now dynamic!
export interface OfflineStorage {
  [key: string]: any[] | {
    lastSync: number;
    pendingActions: ActionRequest[];
    workspaceId: string;
  }; // Dynamic resource arrays or meta object
  meta: {
    lastSync: number;
    pendingActions: ActionRequest[];
    workspaceId: string;
  };
}

// CRUD operation types
const CRUD_OPERATIONS = ['create', 'update', 'delete', 'list', 'get'] as const;
type CrudOperation = typeof CRUD_OPERATIONS[number];

// Ultra-fast action client class
export class ActionClient {
  private baseUrl: string;
  private workspaceUrl: string;
  private db: IDBDatabase | null = null;
  private isOnline = true;
  private pendingActions: ActionRequest[] = [];
  private resourceMethods: Record<string, Record<string, Function>> = {};

  constructor(workspaceUrl: string) {
    this.workspaceUrl = workspaceUrl;
    this.baseUrl = `/api/workspaces/${workspaceUrl}/actions`;
    this.initOfflineDetection();
    this.initIndexedDB();
    this.generateResourceMethods();
  }

  // Generate all resource methods dynamically
  private generateResourceMethods() {
    AVAILABLE_RESOURCES.forEach(resource => {
      const { actionPrefix } = resource;
      
      // Create methods object for this resource
      this.resourceMethods[actionPrefix] = {};
      
      // Generate CRUD operations
      CRUD_OPERATIONS.forEach(operation => {
        const methodName = operation === 'list' ? 'list' : operation;
        
        this.resourceMethods[actionPrefix][methodName] = async (...args: any[]) => {
          return this.executeCrudOperation(actionPrefix, operation, ...args);
        };
      });
    });
  }

  // Execute CRUD operation generically
  private async executeCrudOperation(
    actionPrefix: string, 
    operation: CrudOperation, 
    ...args: any[]
  ): Promise<ActionResponse<any>> {
    const action = `${actionPrefix}.${operation}`;
    
    // Build request based on operation type
    let request: ActionRequest;
    
    switch (operation) {
      case 'create':
        request = { action, data: args[0] };
        break;
      case 'update':
        request = { action, resourceId: args[0], data: args[1] };
        break;
      case 'delete':
        request = { action, resourceId: args[0] };
        break;
      case 'get':
        request = { action, resourceId: args[0] };
        break;
      case 'list':
        request = { action };
        break;
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
    
    return this.executeAction(request);
  }

  // Dynamic method access - creates methods on-demand
  private getResourceMethods(actionPrefix: string) {
    if (!this.resourceMethods[actionPrefix]) {
      throw new Error(`Unknown resource type: ${actionPrefix}`);
    }
    return this.resourceMethods[actionPrefix];
  }

  // Initialize offline/online detection
  private initOfflineDetection() {
    this.isOnline = navigator.onLine;
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncPendingActions();
    });
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  // Initialize IndexedDB for offline storage - now dynamic!
  private async initIndexedDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(`issues-tasks-${this.workspaceUrl}`, 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object stores for each resource type dynamically
        const storeNames = [...Object.values(STORE_MAPPINGS), 'meta'];
        
        console.log('🗄️ ActionClient - Creating IndexedDB stores:', storeNames);
        console.log('🗄️ ActionClient - Store mappings:', STORE_MAPPINGS);
        
        storeNames.forEach(storeName => {
          if (!db.objectStoreNames.contains(storeName)) {
            console.log(`🗄️ ActionClient - Creating store: ${storeName}`);
            const store = db.createObjectStore(storeName, { keyPath: 'id' });
            if (storeName !== 'meta') {
              store.createIndex('workspaceId', 'workspaceId', { unique: false });
              store.createIndex('createdAt', 'createdAt', { unique: false });
              store.createIndex('updatedAt', 'updatedAt', { unique: false });
            }
          } else {
            console.log(`🗄️ ActionClient - Store already exists: ${storeName}`);
          }
        });
        
        console.log('🗄️ ActionClient - Final IndexedDB stores:', Array.from(db.objectStoreNames));
      };
    });
  }

  // Main action execution method - ultra-fast
  async executeAction<T = any>(request: ActionRequest): Promise<ActionResponse<T>> {
    // If offline, queue action and return optimistic response
    if (!this.isOnline) {
      return this.executeOfflineAction(request);
    }

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: ActionResponse<T> = await response.json();
      
      // Cache successful responses in IndexedDB
      if (result.success && result.data) {
        await this.cacheData(request, result.data);
      }
      
      return result;
    } catch (error: any) {
      console.error('Action execution failed:', error);
      
      // If online request fails, try offline mode
      if (this.isOnline) {
        return this.executeOfflineAction(request);
      }
      
      return {
        success: false,
        error: error.message || 'Action execution failed',
        timestamp: Date.now(),
        action: request.action
      };
    }
  }

  // Execute action in offline mode
  private async executeOfflineAction<T = any>(request: ActionRequest): Promise<ActionResponse<T>> {
    // Add to pending actions
    this.pendingActions.push(request);
    await this.savePendingActions();

    // Generate optimistic response
    const optimisticId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      success: true,
      data: { id: optimisticId, ...request.data } as T,
      optimisticId,
      timestamp: Date.now(),
      action: request.action
    };
  }

  // Cache data in IndexedDB - now dynamic!
  private async cacheData(request: ActionRequest, data: any): Promise<void> {
    if (!this.db) return;

    const resourceType = this.getResourceTypeFromAction(request.action);
    if (!resourceType) return;

    try {
      const transaction = this.db.transaction([resourceType], 'readwrite');
      const store = transaction.objectStore(resourceType);
      
      if (Array.isArray(data)) {
        data.forEach(item => store.put(item));
      } else if (data && typeof data === 'object' && data.id) {
        store.put(data);
      }
    } catch (error) {
      console.error('Cache operation failed:', error);
    }
  }

  // Get resource type from action name - now dynamic!
  private getResourceTypeFromAction(action: string): string | null {
    const [resourceType] = action.split('.');
    return STORE_MAPPINGS[resourceType] || null;
  }

  // Get cached data from IndexedDB
  async getCachedData<T = any>(resourceType: string, filter?: Record<string, any>): Promise<T[]> {
    if (!this.db) return [];

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([resourceType], 'readonly');
      const store = transaction.objectStore(resourceType);
      const request = store.getAll();
      
      request.onsuccess = () => {
        let results = request.result || [];
        
        // Apply basic filtering
        if (filter) {
          results = results.filter(item => {
            return Object.entries(filter).every(([key, value]) => item[key] === value);
          });
        }
        
        resolve(results);
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  // Save pending actions to IndexedDB
  private async savePendingActions(): Promise<void> {
    if (!this.db) return;

    try {
      const transaction = this.db.transaction(['meta'], 'readwrite');
      const store = transaction.objectStore('meta');
      
      await store.put({
        id: 'pendingActions',
        actions: this.pendingActions,
        lastUpdated: Date.now()
      });
    } catch (error) {
      console.error('Failed to save pending actions:', error);
    }
  }

  // Sync pending actions when back online
  private async syncPendingActions(): Promise<void> {
    if (this.pendingActions.length === 0) return;

    console.log(`Syncing ${this.pendingActions.length} pending actions...`);
    
    const actionsToSync = [...this.pendingActions];
    this.pendingActions = [];
    
    for (const action of actionsToSync) {
      try {
        await this.executeAction(action);
      } catch (error) {
        console.error('Failed to sync action:', action, error);
        // Re-add failed actions to pending
        this.pendingActions.push(action);
      }
    }
    
    await this.savePendingActions();
  }

  // Dynamic resource method access - replaces all the hardcoded methods!
  // Usage: client.team.create(data) or client.project.update(id, data)
  get team() { return this.getResourceMethods('team'); }
  get project() { return this.getResourceMethods('project'); }
  get label() { return this.getResourceMethods('label'); }
  get labelGroup() { return this.getResourceMethods('labelGroup'); }
  get member() { return this.getResourceMethods('member'); }
  get issueType() { return this.getResourceMethods('issueType'); }
  get state() { return this.getResourceMethods('state'); }
  get statusFlow() { return this.getResourceMethods('statusFlow'); }
  get fieldSet() { return this.getResourceMethods('fieldSet'); }
  get issue() { return this.getResourceMethods('issue'); }
  get comment() { return this.getResourceMethods('comment'); }
  get reaction() { return this.getResourceMethods('reaction'); }

  // Alternative: Dynamic resource access for any resource type
  resource(actionPrefix: string) {
    return this.getResourceMethods(actionPrefix);
  }

  // Hierarchical operations (comments, reactions)
  async createComment(issueId: string, data: Partial<Comment>): Promise<ActionResponse<Comment>> {
    return this.executeAction({
      action: 'comment.create',
      parentId: issueId,
      data
    });
  }

  async createReaction(commentId: string, emoji: string): Promise<ActionResponse<Reaction>> {
    return this.executeAction({
      action: 'reaction.create',
      parentId: commentId,
      data: { emoji }
    });
  }

  async listComments(issueId: string): Promise<ActionResponse<Comment[]>> {
    return this.executeAction({
      action: 'comment.list',
      parentId: issueId
    });
  }

  // Bulk operations
  async bulkDelete(resourceType: string, ids: string[]): Promise<ActionResponse<void>> {
    return this.executeAction({
      action: 'bulk.delete',
      data: { resourceType, ids }
    });
  }

  async bulkUpdate(resourceType: string, ids: string[], updates: Record<string, any>): Promise<ActionResponse<any[]>> {
    return this.executeAction({
      action: 'bulk.update',
      resourceType,
      data: { ids, updates }
    });
  }

  // Bootstrap entire workspace (Linear-style full download)
  async bootstrapWorkspace(): Promise<ActionResponse<any>> {
    const startTime = Date.now();
    
    const response = await this.executeAction({
      action: 'workspace.bootstrap',
      options: { skipCache: false }
    });

    if (response.success && response.data) {
      // Cache all the data in IndexedDB
      await this.cacheBootstrapData(response.data);
    }

    // Bootstrap timing
    const clientTime = Date.now() - startTime;
    
    return {
      success: true,
      data: {
        ...response.data,
        clientTime,
        timestamp: Date.now()
      },
      timestamp: Date.now(),
      action: 'workspace.bootstrap'
    };
  }

  // Cache all bootstrap data efficiently
  private async cacheBootstrapData(data: any): Promise<void> {
    if (!this.db) return;

    const startTime = Date.now();
    
    try {
      // Clear existing data first
      await this.clearAllCaches();
      
      // Cache all resource types dynamically
      const cachePromises = AVAILABLE_RESOURCES.map(resource => {
        const resourceData = data[resource.storeName];
        return this.cacheResourceArray(resource.storeName, resourceData);
      });

      await Promise.all(cachePromises);

      // Cache metadata
      await this.cacheMetadata({
        lastBootstrap: Date.now(),
        bootstrapTime: data.meta.bootstrapTime,
        totalRecords: data.meta.totalRecords,
        workspaceId: data.workspace.id
      });

      const cacheTime = Date.now() - startTime;
      const totalRecords = Object.values(data.meta.totalRecords).reduce((sum: number, count) => sum + (count as number), 0);
      console.log(`💾 Cached ${totalRecords} records in ${cacheTime}ms`);
      
    } catch (error) {
      console.error('Bootstrap cache failed:', error);
    }
  }

  // Cache an array of resources efficiently
  private async cacheResourceArray(resourceType: string, resources: any[]): Promise<void> {
    if (!this.db || !resources || resources.length === 0) return;

    const transaction = this.db.transaction([resourceType], 'readwrite');
    const store = transaction.objectStore(resourceType);
    
    const promises = resources.map(resource => {
      return new Promise<void>((resolve, reject) => {
        const request = store.put(resource);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    });

    await Promise.all(promises);
  }

  // Cache metadata about the bootstrap
  private async cacheMetadata(meta: any): Promise<void> {
    if (!this.db) return;

    const transaction = this.db.transaction(['meta'], 'readwrite');
    const store = transaction.objectStore('meta');
    
    return new Promise<void>((resolve, reject) => {
      const request = store.put({ id: 'bootstrap', ...meta });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Clear all caches (for fresh bootstrap) - now dynamic!
  private async clearAllCaches(): Promise<void> {
    if (!this.db) return;

    const storeNames = Object.values(STORE_MAPPINGS);
    
    const clearPromises = storeNames.map(storeName => {
      return new Promise<void>((resolve, reject) => {
        const transaction = this.db!.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    });

    await Promise.all(clearPromises);
  }

  // Check if we have recent bootstrap data
  async hasRecentBootstrap(maxAgeMs: number = 300000): Promise<boolean> { // 5 minutes default
    if (!this.db) return false;

    return new Promise<boolean>((resolve) => {
      const transaction = this.db!.transaction(['meta'], 'readonly');
      const store = transaction.objectStore('meta');
      const request = store.get('bootstrap');
      
      request.onsuccess = () => {
        const result = request.result;
        if (result && result.lastBootstrap) {
          const age = Date.now() - result.lastBootstrap;
          resolve(age < maxAgeMs);
        } else {
          resolve(false);
        }
      };
      
      request.onerror = () => resolve(false);
    });
  }

  // Get cached data with fallback to server
  async getCachedDataWithFallback<T = any>(resourceType: string, filter?: Record<string, any>): Promise<T[]> {
    // Try cache first
    const cached = await this.getCachedData<T>(resourceType, filter);
    
    if (cached.length > 0) {
      return cached;
    }

    // Fallback to server if cache empty
    const response = await this.executeAction({
      action: `${resourceType.replace(/s$/, '')}.list`
    });

    return response.success ? response.data : [];
  }

  // Get available resource types - useful for debugging or dynamic UIs
  getAvailableResources(): string[] {
    return AVAILABLE_RESOURCES.map(r => r.actionPrefix);
  }

  // Utility methods
  isOffline(): boolean {
    return !this.isOnline;
  }

  getPendingActionsCount(): number {
    return this.pendingActions.length;
  }

  async clearCache(): Promise<void> {
    if (!this.db) return;

    const storeNames = Object.values(STORE_MAPPINGS);
    const transaction = this.db.transaction(storeNames, 'readwrite');
    
    storeNames.forEach(storeName => {
      transaction.objectStore(storeName).clear();
    });
  }
}

// Export singleton factory
export function createActionClient(workspaceUrl: string): ActionClient {
  return new ActionClient(workspaceUrl);
} 