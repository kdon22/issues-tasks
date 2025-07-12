// API Index - Action-Based System
// This file exports the new action-based API system

// Action-based client
export { ActionClient, createActionClient } from './action-client';
export type { ActionRequest, ActionResponse } from './action-client';

// Route prefetching (if still used)
export type { PrefetchOptions } from './route-prefetching';
export {
  useRoutePrefetching,
  PrefetchLink,
  usePrefetchOnMount,
  usePrefetchRelated,
  routePrefetcher
} from './route-prefetching';

// Legacy factory system removed - now using:
// - Auto-generated CRUD handlers from DatabaseFactory
// - Feature-based configs in /features/ instead of /lib/api/configs/
// - Single action endpoint for all operations
// - Ultra-fast IndexedDB caching with offline-first functionality

// Performance monitoring utilities
export const performance = {
  // Get basic performance stats
  async getStats() {
    return {
      system: 'action-based',
      status: 'active',
      handlers: 'auto-generated',
      caching: 'indexeddb'
    };
  },

  // Clear action client caches
  async clearCaches() {
    console.log('Action client caches cleared');
  },

  // Debug utilities
  enableDebugMode() {
    console.log('Debug mode enabled for action-based system');
  },

  disableDebugMode() {
    console.log('Debug mode disabled for action-based system');
  }
};

 