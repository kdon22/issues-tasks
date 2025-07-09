// Hooks - Ultra-Fast Action-Based System with IndexedDB
export * from './use-auto-save';
export * from './use-editable-auto-save';
export * from './use-keyboard-shortcuts';
export * from './use-permissions';
export * from './use-current-workspace';
export * from './use-rich-text-auto-save';

// Export the new EXTREMELY DRY action-based hooks
export {
  // Core hooks that actually exist
  useActionClient,
  useActionMutation,
  useActionQuery,
  useOfflineStatus,
  
  // Resource factory and instances
  createResourceHooks,
  resourceHooks,
  
  // Utility for creating new resource hooks
  createNewResourceHooks
} from './use-action-api';

// 🚀 USAGE EXAMPLES:
//
// // Use individual resource hooks:
// const { data: teams } = teamHooks.useList();
// const createTeam = teamHooks.useCreate();
// const updateTeam = teamHooks.useUpdate();
// const deleteTeam = teamHooks.useDelete();
//
// // Or use the generic factory:
// const customHooks = createResourceHooks<CustomResource>('custom');
// const { data: customItems } = customHooks.useList();
//
// // Or use the convenience method:
// const newHooks = createNewResourceHooks<NewResource>('newResource'); 