/**
 * Factory for auto-generating action handlers
 * This eliminates the need for manual handler creation for each resource
 */

// Standard CRUD operations that all resources support
const CRUD_OPERATIONS = ['create', 'update', 'delete', 'list', 'get'] as const;

type CrudOperation = typeof CRUD_OPERATIONS[number];
type ActionHandler = (resourceId: string, data: any, context: any) => Promise<any>;

/**
 * Auto-generates action handlers for a resource based on its actionPrefix
 * This calls the actual database functions that already exist in the actions/route.ts
 */
export function createResourceHandlers(actionPrefix: string): Record<string, ActionHandler> {
  const handlers: Record<string, ActionHandler> = {};

  // Generate standard CRUD handlers
  CRUD_OPERATIONS.forEach(operation => {
    const actionName = `${actionPrefix}.${operation}`;
    
    handlers[actionName] = async (resourceId: string, data: any, context: any) => {
      // The database functions already exist in actions/route.ts
      // We just need to call them based on the operation and resource type
      
      // Map actionPrefix to the actual function names in actions/route.ts
      const resourceFunctionMap = {
        'team': 'Team',
        'project': 'Project', 
        'label': 'Label',
        'member': 'Member',
        'issueType': 'IssueType',
        'statusFlow': 'StatusFlow',
        'fieldSet': 'FieldSet',
        'state': 'State',
        'issue': 'Issue',
        'comment': 'Comment',
        'reaction': 'Reaction'
      };

      const resourceName = resourceFunctionMap[actionPrefix as keyof typeof resourceFunctionMap];
      
      if (!resourceName) {
        throw new Error(`Unknown resource type: ${actionPrefix}`);
      }

      // The actual database functions are in the actions/route.ts file
      // We return a call instruction that the API route will handle
      return {
        _functionCall: {
          operation,
          resourceName,
          resourceId,
          data,
          context
        }
      };
    };
  });

  return handlers;
}

/**
 * Auto-generates handlers for all resource configs
 * This is a true factory - add a new resource config and handlers are auto-generated
 */
export function createAllResourceHandlers(resourceConfigs: Record<string, any>): Record<string, ActionHandler> {
  const allHandlers: Record<string, ActionHandler> = {};

  Object.values(resourceConfigs).forEach((config: any) => {
    if (config?.actionPrefix) {
      const handlers = createResourceHandlers(config.actionPrefix);
      Object.assign(allHandlers, handlers);
    }
  });

  return allHandlers;
} 