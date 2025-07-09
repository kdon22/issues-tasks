import { generatedHandlers } from './database-factory';

// Auto-generated handlers from factory - no manual work needed!
// Add a new resource config and handlers are automatically generated
export const actionHandlers = {
  ...generatedHandlers,
  
  // Add any custom non-CRUD actions here
  'workspace.bootstrap': async (resourceId: string, data: any, context: any) => {
    // This would call the bootstrap function
    // For now, we'll keep the existing bootstrap logic
    throw new Error('Bootstrap action not yet implemented in factory');
  },
  
  'bulk.delete': async (resourceId: string, data: any, context: any) => {
    // Bulk operations can be added here
    throw new Error('Bulk delete not yet implemented in factory');
  },
  
  'bulk.update': async (resourceId: string, data: any, context: any) => {
    // Bulk operations can be added here
    throw new Error('Bulk update not yet implemented in factory');
  }
}; 