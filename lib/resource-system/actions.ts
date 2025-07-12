import { toast } from 'sonner';
import { ResourceSchema } from './schemas';

// Action result types
export interface ActionResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  optimisticId?: string; // For optimistic updates
}

// Command interface for undo/redo support
export interface Command<T = any> {
  id: string;
  type: ActionType;
  resourceKey: string;
  execute(): Promise<ActionResult<T>>;
  undo(): Promise<ActionResult<T>>;
  canUndo: boolean;
  description: string;
  mobileDescription?: string; // Shorter description for mobile
}

// Action types
export type ActionType = 'create' | 'update' | 'delete' | 'duplicate' | 'bulk-delete' | 'bulk-update' | 'custom';

// Action context for mobile/desktop awareness
export interface ActionContext {
  isMobile: boolean;
  showToasts: boolean;
  optimisticUpdates: boolean;
  resourceSchema: ResourceSchema;
}

// Action handler interface
export interface ActionHandler<T = any> {
  create: (data: Partial<T>) => Promise<ActionResult<T>>;
  update: (id: string, data: Partial<T>) => Promise<ActionResult<T>>;
  delete: (id: string) => Promise<ActionResult<void>>;
  duplicate: (id: string) => Promise<ActionResult<T>>;
  bulkDelete: (ids: string[]) => Promise<ActionResult<void>>;
  bulkUpdate: (ids: string[], data: Partial<T>) => Promise<ActionResult<T[]>>;
  custom: (action: string, data: any) => Promise<ActionResult<any>>;
}

// Command history for undo/redo
export class CommandHistory {
  private commands: Command[] = [];
  private currentIndex = -1;
  private maxHistorySize = 50;

  execute<T>(command: Command<T>): Promise<ActionResult<T>> {
    // Remove any commands after current index (when we're not at the end)
    if (this.currentIndex < this.commands.length - 1) {
      this.commands = this.commands.slice(0, this.currentIndex + 1);
    }

    // Add new command
    this.commands.push(command);
    this.currentIndex++;

    // Limit history size
    if (this.commands.length > this.maxHistorySize) {
      this.commands.shift();
      this.currentIndex--;
    }

    return command.execute();
  }

  async undo(): Promise<ActionResult | null> {
    if (!this.canUndo()) return null;

    const command = this.commands[this.currentIndex];
    if (!command.canUndo) return null;

    const result = await command.undo();
    if (result.success) {
      this.currentIndex--;
    }
    return result;
  }

  async redo(): Promise<ActionResult | null> {
    if (!this.canRedo()) return null;

    const command = this.commands[this.currentIndex + 1];
    const result = await command.execute();
    if (result.success) {
      this.currentIndex++;
    }
    return result;
  }

  canUndo(): boolean {
    return this.currentIndex >= 0 && this.commands[this.currentIndex]?.canUndo;
  }

  canRedo(): boolean {
    return this.currentIndex < this.commands.length - 1;
  }

  getUndoDescription(): string | null {
    if (!this.canUndo()) return null;
    return this.commands[this.currentIndex]?.description || null;
  }

  getRedoDescription(): string | null {
    if (!this.canRedo()) return null;
    return this.commands[this.currentIndex + 1]?.description || null;
  }

  clear(): void {
    this.commands = [];
    this.currentIndex = -1;
  }
}

// Create action commands with mobile-optimized UI
export class ResourceActionFactory<T extends { id: string }> {
  private commandHistory = new CommandHistory();
  private context: ActionContext;
  private handler: ActionHandler<T>;

  constructor(
    context: ActionContext,
    handler: ActionHandler<T>
  ) {
    this.context = context;
    this.handler = handler;
  }

  // CREATE ACTION
  createAction(data: Partial<T>): Command<T> {
    const resourceName = this.context.resourceSchema.name.singular;
    const itemName = (data as any).name || (data as any).title || resourceName;
    
    return {
      id: `create-${Date.now()}`,
      type: 'create',
      resourceKey: this.context.resourceSchema.databaseKey,
      canUndo: true,
      description: `Create ${itemName}`,
      mobileDescription: `Create ${itemName}`,
      
      execute: async () => {
        try {
          const result = await this.handler.create(data);
          
          if (result.success && this.context.showToasts) {
            toast.success(
              this.context.isMobile 
                ? `${itemName} created` 
                : `${itemName} created successfully`
            );
          }
          
          return result;
        } catch (error: any) {
          const errorMessage = error.message || 'Failed to create item';
          
          if (this.context.showToasts) {
            toast.error(
              this.context.isMobile 
                ? `Failed to create ${itemName}` 
                : `Failed to create ${itemName}: ${errorMessage}`
            );
          }
          
          return { success: false, error: errorMessage };
        }
      },
      
      undo: async () => {
        try {
          // To undo create, we need to delete the created item
          // This assumes the create result contains the created item's ID
          const result = await this.handler.delete((data as any).id);
          
          if (result.success && this.context.showToasts) {
            toast.success(
              this.context.isMobile 
                ? `Undid create ${itemName}` 
                : `Undid creation of ${itemName}`
            );
          }
          
          return result;
        } catch (error: any) {
          const errorMessage = error.message || 'Failed to undo creation';
          
          if (this.context.showToasts) {
            toast.error(
              this.context.isMobile 
                ? `Failed to undo` 
                : `Failed to undo creation: ${errorMessage}`
            );
          }
          
          return { success: false, error: errorMessage };
        }
      }
    };
  }

  // UPDATE ACTION
  updateAction(id: string, data: Partial<T>, originalData?: T): Command<T> {
    const resourceName = this.context.resourceSchema.name.singular;
    const itemName = (data as any).name || (originalData as any)?.name || resourceName;
    
    return {
      id: `update-${id}-${Date.now()}`,
      type: 'update',
      resourceKey: this.context.resourceSchema.databaseKey,
      canUndo: !!originalData,
      description: `Update ${itemName}`,
      mobileDescription: `Update ${itemName}`,
      
      execute: async () => {
        try {
          const result = await this.handler.update(id, data);
          
          if (result.success && this.context.showToasts) {
            toast.success(
              this.context.isMobile 
                ? `${itemName} updated` 
                : `${itemName} updated successfully`
            );
          }
          
          return result;
        } catch (error: any) {
          const errorMessage = error.message || 'Failed to update item';
          
          if (this.context.showToasts) {
            toast.error(
              this.context.isMobile 
                ? `Failed to update ${itemName}` 
                : `Failed to update ${itemName}: ${errorMessage}`
            );
          }
          
          return { success: false, error: errorMessage };
        }
      },
      
      undo: async () => {
        if (!originalData) {
          return { success: false, error: 'No original data available for undo' };
        }
        
        try {
          const result = await this.handler.update(id, originalData);
          
          if (result.success && this.context.showToasts) {
            toast.success(
              this.context.isMobile 
                ? `Undid update ${itemName}` 
                : `Undid update of ${itemName}`
            );
          }
          
          return result;
        } catch (error: any) {
          const errorMessage = error.message || 'Failed to undo update';
          
          if (this.context.showToasts) {
            toast.error(
              this.context.isMobile 
                ? `Failed to undo` 
                : `Failed to undo update: ${errorMessage}`
            );
          }
          
          return { success: false, error: errorMessage };
        }
      }
    };
  }

  // DELETE ACTION
  deleteAction(item: T): Command<void> {
    const resourceName = this.context.resourceSchema.name.singular;
    const itemName = (item as any).name || (item as any).title || resourceName;
    
    return {
      id: `delete-${item.id}-${Date.now()}`,
      type: 'delete',
      resourceKey: this.context.resourceSchema.databaseKey,
      canUndo: true,
      description: `Delete ${itemName}`,
      mobileDescription: `Delete ${itemName}`,
      
      execute: async () => {
        try {
          const result = await this.handler.delete(item.id);
          
          if (result.success && this.context.showToasts) {
            toast.success(
              this.context.isMobile 
                ? `${itemName} deleted` 
                : `${itemName} deleted successfully`
            );
          }
          
          return result;
        } catch (error: any) {
          const errorMessage = error.message || 'Failed to delete item';
          
          if (this.context.showToasts) {
            toast.error(
              this.context.isMobile 
                ? `Failed to delete ${itemName}` 
                : `Failed to delete ${itemName}: ${errorMessage}`
            );
          }
          
          return { success: false, error: errorMessage };
        }
      },
      
      undo: async () => {
        try {
          const result = await this.handler.create(item);
          
          if (result.success && this.context.showToasts) {
            toast.success(
              this.context.isMobile 
                ? `Restored ${itemName}` 
                : `Restored ${itemName}`
            );
          }
          
          return result;
        } catch (error: any) {
          const errorMessage = error.message || 'Failed to restore item';
          
          if (this.context.showToasts) {
            toast.error(
              this.context.isMobile 
                ? `Failed to restore` 
                : `Failed to restore ${itemName}: ${errorMessage}`
            );
          }
          
          return { success: false, error: errorMessage };
        }
      }
    };
  }

  // DUPLICATE ACTION
  duplicateAction(item: T): Command<T> {
    const resourceName = this.context.resourceSchema.name.singular;
    const itemName = (item as any).name || (item as any).title || resourceName;
    
    return {
      id: `duplicate-${item.id}-${Date.now()}`,
      type: 'duplicate',
      resourceKey: this.context.resourceSchema.databaseKey,
      canUndo: true,
      description: `Duplicate ${itemName}`,
      mobileDescription: `Duplicate ${itemName}`,
      
      execute: async () => {
        try {
          const result = await this.handler.duplicate(item.id);
          
          if (result.success && this.context.showToasts) {
            toast.success(
              this.context.isMobile 
                ? `${itemName} duplicated` 
                : `${itemName} duplicated successfully`
            );
          }
          
          return result;
        } catch (error: any) {
          const errorMessage = error.message || 'Failed to duplicate item';
          
          if (this.context.showToasts) {
            toast.error(
              this.context.isMobile 
                ? `Failed to duplicate ${itemName}` 
                : `Failed to duplicate ${itemName}: ${errorMessage}`
            );
          }
          
          return { success: false, error: errorMessage };
        }
      },
      
      undo: async () => {
        try {
          // To undo duplicate, we need to delete the duplicated item
          // This assumes the duplicate result contains the new item's ID
          const result = await this.handler.delete((item as any).id);
          
          if (result.success && this.context.showToasts) {
            toast.success(
              this.context.isMobile 
                ? `Undid duplicate ${itemName}` 
                : `Undid duplication of ${itemName}`
            );
          }
          
          return result;
        } catch (error: any) {
          const errorMessage = error.message || 'Failed to undo duplication';
          
          if (this.context.showToasts) {
            toast.error(
              this.context.isMobile 
                ? `Failed to undo` 
                : `Failed to undo duplication: ${errorMessage}`
            );
          }
          
          return { success: false, error: errorMessage };
        }
      }
    };
  }

  // BULK DELETE ACTION
  bulkDeleteAction(items: T[]): Command<void> {
    const resourceName = this.context.resourceSchema.name.plural;
    const count = items.length;
    
    return {
      id: `bulk-delete-${Date.now()}`,
      type: 'bulk-delete',
      resourceKey: this.context.resourceSchema.databaseKey,
      canUndo: true,
      description: `Delete ${count} ${resourceName}`,
      mobileDescription: `Delete ${count} items`,
      
      execute: async () => {
        try {
          const ids = items.map(item => item.id);
          const result = await this.handler.bulkDelete(ids);
          
          if (result.success && this.context.showToasts) {
            toast.success(
              this.context.isMobile 
                ? `${count} items deleted` 
                : `${count} ${resourceName} deleted successfully`
            );
          }
          
          return result;
        } catch (error: any) {
          const errorMessage = error.message || 'Failed to delete items';
          
          if (this.context.showToasts) {
            toast.error(
              this.context.isMobile 
                ? `Failed to delete ${count} items` 
                : `Failed to delete ${count} ${resourceName}: ${errorMessage}`
            );
          }
          
          return { success: false, error: errorMessage };
        }
      },
      
      undo: async () => {
        try {
          // To undo bulk delete, we need to recreate all items
          const promises = items.map(item => this.handler.create(item));
          const results = await Promise.all(promises);
          
          const success = results.every(r => r.success);
          
          if (success && this.context.showToasts) {
            toast.success(
              this.context.isMobile 
                ? `Restored ${count} items` 
                : `Restored ${count} ${resourceName}`
            );
          }
          
          return { success };
        } catch (error: any) {
          const errorMessage = error.message || 'Failed to restore items';
          
          if (this.context.showToasts) {
            toast.error(
              this.context.isMobile 
                ? `Failed to restore items` 
                : `Failed to restore ${resourceName}: ${errorMessage}`
            );
          }
          
          return { success: false, error: errorMessage };
        }
      }
    };
  }

  // Execute action with history
  async executeAction<R>(action: Command<R>): Promise<ActionResult<R>> {
    return this.commandHistory.execute(action);
  }

  // Undo last action
  async undo(): Promise<ActionResult | null> {
    return this.commandHistory.undo();
  }

  // Redo last undone action
  async redo(): Promise<ActionResult | null> {
    return this.commandHistory.redo();
  }

  // Check if undo/redo is available
  canUndo(): boolean {
    return this.commandHistory.canUndo();
  }

  canRedo(): boolean {
    return this.commandHistory.canRedo();
  }

  // Get action descriptions for UI
  getUndoDescription(): string | null {
    const description = this.commandHistory.getUndoDescription();
    if (!description) return null;
    
    return this.context.isMobile 
      ? `Undo ${description}` 
      : `Undo: ${description}`;
  }

  getRedoDescription(): string | null {
    const description = this.commandHistory.getRedoDescription();
    if (!description) return null;
    
    return this.context.isMobile 
      ? `Redo ${description}` 
      : `Redo: ${description}`;
  }

  // Clear command history
  clearHistory(): void {
    this.commandHistory.clear();
  }
}

// Mobile-optimized action configuration
export interface MobileActionConfig {
  showInFAB: boolean;
  showInCard: boolean;
  showInList: boolean;
  icon: string;
  label: string;
  shortLabel?: string;
  destructive?: boolean;
  confirmRequired?: boolean;
  confirmMessage?: string;
  mobileConfirmMessage?: string;
}

// Action configuration for mobile/desktop
export const ACTION_CONFIGS: Record<ActionType, MobileActionConfig> = {
  create: {
    showInFAB: true,
    showInCard: false,
    showInList: false,
    icon: 'Plus',
    label: 'Create',
    shortLabel: 'Add'
  },
  update: {
    showInFAB: false,
    showInCard: true,
    showInList: true,
    icon: 'Edit',
    label: 'Edit',
    shortLabel: 'Edit'
  },
  delete: {
    showInFAB: false,
    showInCard: true,
    showInList: true,
    icon: 'Trash2',
    label: 'Delete',
    shortLabel: 'Delete',
    destructive: true,
    confirmRequired: true,
    confirmMessage: 'Are you sure you want to delete this item?',
    mobileConfirmMessage: 'Delete this item?'
  },
  duplicate: {
    showInFAB: false,
    showInCard: true,
    showInList: true,
    icon: 'Copy',
    label: 'Duplicate',
    shortLabel: 'Copy'
  },
  'bulk-delete': {
    showInFAB: false,
    showInCard: false,
    showInList: false,
    icon: 'Trash2',
    label: 'Delete Selected',
    shortLabel: 'Delete',
    destructive: true,
    confirmRequired: true,
    confirmMessage: 'Are you sure you want to delete the selected items?',
    mobileConfirmMessage: 'Delete selected items?'
  },
  'bulk-update': {
    showInFAB: false,
    showInCard: false,
    showInList: false,
    icon: 'Edit',
    label: 'Update Selected',
    shortLabel: 'Update'
  },
  custom: {
    showInFAB: false,
    showInCard: false,
    showInList: false,
    icon: 'MoreHorizontal',
    label: 'Custom Action',
    shortLabel: 'Action'
  }
};

// Helper function to get action config
export function getActionConfig(actionType: ActionType): MobileActionConfig {
  return ACTION_CONFIGS[actionType];
}

// Helper function to check if action should be shown in mobile context
export function shouldShowActionInMobile(actionType: ActionType, context: 'fab' | 'card' | 'list'): boolean {
  const config = getActionConfig(actionType);
  switch (context) {
    case 'fab':
      return config.showInFAB;
    case 'card':
      return config.showInCard;
    case 'list':
      return config.showInList;
    default:
      return false;
  }
}

// Export types
export type { Command, ActionResult, ActionHandler, ActionContext };
// CommandHistory already exported above 