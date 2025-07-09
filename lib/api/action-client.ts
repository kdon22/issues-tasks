import { z } from 'zod';

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

// IndexedDB schema for offline storage
export interface OfflineStorage {
  teams: Team[];
  projects: Project[];
  labels: Label[];
  members: Member[];
  issueTypes: IssueType[];
  states: State[];
  issues: Issue[];
  comments: Comment[];
  reactions: Reaction[];
  meta: {
    lastSync: number;
    pendingActions: ActionRequest[];
    workspaceId: string;
  };
}

// Resource interfaces
export interface Team {
  id: string;
  name: string;
  identifier: string;
  description?: string;
  avatarType: string;
  avatarIcon?: string;
  avatarColor?: string;
  workspaceId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
  workspaceId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Label {
  id: string;
  name: string;
  description?: string;
  color: string;
  workspaceId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Member {
  id: string;
  name?: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface IssueType {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  workspaceId: string;
  createdAt: string;
  updatedAt: string;
}

export interface State {
  id: string;
  name: string;
  description?: string;
  color: string;
  type: string;
  position: number;
  statusFlowId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Issue {
  id: string;
  title: string;
  description?: string;
  identifier: string;
  priority: string;
  workspaceId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Reaction {
  id: string;
  emoji: string;
  count: number;
  users: {
    id: string;
    name: string | null;
    email: string;
  }[];
  hasReacted: boolean;
}

export interface Comment {
  id: string;
  content: string;
  issueId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
  reactions: Reaction[];
  replies?: Comment[];
}

// Ultra-fast action client class
export class ActionClient {
  private baseUrl: string;
  private workspaceUrl: string;
  private db: IDBDatabase | null = null;
  private isOnline = true;
  private pendingActions: ActionRequest[] = [];

  constructor(workspaceUrl: string) {
    this.workspaceUrl = workspaceUrl;
    this.baseUrl = `/api/workspaces/${workspaceUrl}/actions`;
    this.initOfflineDetection();
    this.initIndexedDB();
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

  // Initialize IndexedDB for offline storage
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
        
        // Create object stores for each resource type
        const stores = ['teams', 'projects', 'labels', 'members', 'issueTypes', 'states', 'issues', 'comments', 'reactions', 'meta'];
        
        stores.forEach(storeName => {
          if (!db.objectStoreNames.contains(storeName)) {
            const store = db.createObjectStore(storeName, { keyPath: 'id' });
            if (storeName !== 'meta') {
              store.createIndex('workspaceId', 'workspaceId', { unique: false });
              store.createIndex('createdAt', 'createdAt', { unique: false });
              store.createIndex('updatedAt', 'updatedAt', { unique: false });
            }
          }
        });
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

  // Cache data in IndexedDB
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

  // Get resource type from action name
  private getResourceTypeFromAction(action: string): string | null {
    const [resourceType] = action.split('.');
    const resourceMap: Record<string, string> = {
      'team': 'teams',
      'project': 'projects',
      'label': 'labels',
      'member': 'members',
      'issueType': 'issueTypes',
      'state': 'states',
      'issue': 'issues',
      'comment': 'comments',
      'reaction': 'reactions'
    };
    return resourceMap[resourceType] || null;
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

  // Resource-specific convenience methods
  
  // Teams
  async createTeam(data: Partial<Team>): Promise<ActionResponse<Team>> {
    return this.executeAction({
      action: 'team.create',
      data
    });
  }

  async updateTeam(id: string, data: Partial<Team>): Promise<ActionResponse<Team>> {
    return this.executeAction({
      action: 'team.update',
      resourceId: id,
      data
    });
  }

  async deleteTeam(id: string): Promise<ActionResponse<void>> {
    return this.executeAction({
      action: 'team.delete',
      resourceId: id
    });
  }

  async listTeams(): Promise<ActionResponse<Team[]>> {
    return this.executeAction({
      action: 'team.list'
    });
  }

  async getTeam(id: string): Promise<ActionResponse<Team>> {
    return this.executeAction({
      action: 'team.get',
      resourceId: id
    });
  }

  // Projects
  async createProject(data: Partial<Project>): Promise<ActionResponse<Project>> {
    return this.executeAction({
      action: 'project.create',
      data
    });
  }

  async updateProject(id: string, data: Partial<Project>): Promise<ActionResponse<Project>> {
    return this.executeAction({
      action: 'project.update',
      resourceId: id,
      data
    });
  }

  async deleteProject(id: string): Promise<ActionResponse<void>> {
    return this.executeAction({
      action: 'project.delete',
      resourceId: id
    });
  }

  async listProjects(): Promise<ActionResponse<Project[]>> {
    return this.executeAction({
      action: 'project.list'
    });
  }

  async getProject(id: string): Promise<ActionResponse<Project>> {
    return this.executeAction({
      action: 'project.get',
      resourceId: id
    });
  }

  // Labels
  async createLabel(data: Partial<Label>): Promise<ActionResponse<Label>> {
    return this.executeAction({
      action: 'label.create',
      data
    });
  }

  async updateLabel(id: string, data: Partial<Label>): Promise<ActionResponse<Label>> {
    return this.executeAction({
      action: 'label.update',
      resourceId: id,
      data
    });
  }

  async deleteLabel(id: string): Promise<ActionResponse<void>> {
    return this.executeAction({
      action: 'label.delete',
      resourceId: id
    });
  }

  async listLabels(): Promise<ActionResponse<Label[]>> {
    return this.executeAction({
      action: 'label.list'
    });
  }

  async getLabel(id: string): Promise<ActionResponse<Label>> {
    return this.executeAction({
      action: 'label.get',
      resourceId: id
    });
  }

  // Members
  async createMember(data: Partial<Member>): Promise<ActionResponse<Member>> {
    return this.executeAction({
      action: 'member.create',
      data
    });
  }

  async updateMember(id: string, data: Partial<Member>): Promise<ActionResponse<Member>> {
    return this.executeAction({
      action: 'member.update',
      resourceId: id,
      data
    });
  }

  async deleteMember(id: string): Promise<ActionResponse<void>> {
    return this.executeAction({
      action: 'member.delete',
      resourceId: id
    });
  }

  async listMembers(): Promise<ActionResponse<Member[]>> {
    return this.executeAction({
      action: 'member.list'
    });
  }

  async getMember(id: string): Promise<ActionResponse<Member>> {
    return this.executeAction({
      action: 'member.get',
      resourceId: id
    });
  }

  // Issue Types
  async createIssueType(data: Partial<IssueType>): Promise<ActionResponse<IssueType>> {
    return this.executeAction({
      action: 'issueType.create',
      data
    });
  }

  async updateIssueType(id: string, data: Partial<IssueType>): Promise<ActionResponse<IssueType>> {
    return this.executeAction({
      action: 'issueType.update',
      resourceId: id,
      data
    });
  }

  async deleteIssueType(id: string): Promise<ActionResponse<void>> {
    return this.executeAction({
      action: 'issueType.delete',
      resourceId: id
    });
  }

  async listIssueTypes(): Promise<ActionResponse<IssueType[]>> {
    return this.executeAction({
      action: 'issueType.list'
    });
  }

  async getIssueType(id: string): Promise<ActionResponse<IssueType>> {
    return this.executeAction({
      action: 'issueType.get',
      resourceId: id
    });
  }

  // States
  async createState(data: Partial<State>): Promise<ActionResponse<State>> {
    return this.executeAction({
      action: 'state.create',
      data
    });
  }

  async updateState(id: string, data: Partial<State>): Promise<ActionResponse<State>> {
    return this.executeAction({
      action: 'state.update',
      resourceId: id,
      data
    });
  }

  async deleteState(id: string): Promise<ActionResponse<void>> {
    return this.executeAction({
      action: 'state.delete',
      resourceId: id
    });
  }

  async listStates(): Promise<ActionResponse<State[]>> {
    return this.executeAction({
      action: 'state.list'
    });
  }

  async getState(id: string): Promise<ActionResponse<State>> {
    return this.executeAction({
      action: 'state.get',
      resourceId: id
    });
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

  async updateComment(id: string, data: Partial<Comment>): Promise<ActionResponse<Comment>> {
    return this.executeAction({
      action: 'comment.update',
      resourceId: id,
      data
    });
  }

  async deleteComment(id: string): Promise<ActionResponse<void>> {
    return this.executeAction({
      action: 'comment.delete',
      resourceId: id
    });
  }

  async listComments(issueId: string): Promise<ActionResponse<Comment[]>> {
    return this.executeAction({
      action: 'comment.list',
      parentId: issueId
    });
  }

  async deleteReaction(id: string): Promise<ActionResponse<void>> {
    return this.executeAction({
      action: 'reaction.delete',
      resourceId: id
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

    const clientTime = Date.now() - startTime;
    console.log(`🚀 Workspace bootstrap completed in ${clientTime}ms`);
    
    return response;
  }

  // Cache all bootstrap data efficiently
  private async cacheBootstrapData(data: any): Promise<void> {
    if (!this.db) return;

    const startTime = Date.now();
    
    try {
      // Clear existing data first
      await this.clearAllCaches();
      
      // Cache all resource types
      const cachePromises = [
        this.cacheResourceArray('teams', data.teams),
        this.cacheResourceArray('projects', data.projects),
        this.cacheResourceArray('labels', data.labels),
        this.cacheResourceArray('members', data.members),
        this.cacheResourceArray('issueTypes', data.issueTypes),
        this.cacheResourceArray('states', data.states),
        this.cacheResourceArray('issues', data.issues),
        this.cacheResourceArray('comments', data.comments)
      ];

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

  // Clear all caches (for fresh bootstrap)
  private async clearAllCaches(): Promise<void> {
    if (!this.db) return;

    const stores = ['teams', 'projects', 'labels', 'members', 'issueTypes', 'states', 'issues', 'comments'];
    
    const clearPromises = stores.map(storeName => {
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

  // Utility methods
  isOffline(): boolean {
    return !this.isOnline;
  }

  getPendingActionsCount(): number {
    return this.pendingActions.length;
  }

  async clearCache(): Promise<void> {
    if (!this.db) return;

    const stores = ['teams', 'projects', 'labels', 'members', 'issueTypes', 'states', 'issues', 'comments', 'reactions'];
    const transaction = this.db.transaction(stores, 'readwrite');
    
    stores.forEach(storeName => {
      transaction.objectStore(storeName).clear();
    });
  }
}

// Export singleton factory
export function createActionClient(workspaceUrl: string): ActionClient {
  return new ActionClient(workspaceUrl);
} 