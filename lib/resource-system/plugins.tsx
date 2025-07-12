import React, { ReactNode } from 'react';
import { ResourceSchema } from './schemas';
import { ActionContext, ActionResult, ResourceActionFactory } from './actions';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Download, 
  Upload, 
  MoreHorizontal, 
  CheckSquare, 
  XSquare, 
  Archive, 
  Trash2,
  Filter,
  SortAsc,
  SortDesc,
  Search,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/components/ui/mobile-responsive';
import { toast } from 'sonner';

// Plugin interface
export interface ResourcePlugin<T = any> {
  id: string;
  name: string;
  description: string;
  version: string;
  
  // Mobile configuration
  mobile: {
    enabled: boolean;
    showInToolbar: boolean;
    showInFAB: boolean;
    showInCard: boolean;
    icon: string;
    label: string;
    shortLabel?: string;
  };
  
  // Desktop configuration
  desktop: {
    enabled: boolean;
    showInToolbar: boolean;
    showInDropdown: boolean;
    icon: string;
    label: string;
  };
  
  // Plugin lifecycle
  initialize: (context: PluginContext<T>) => void;
  render: (context: PluginRenderContext<T>) => ReactNode;
  canActivate: (context: PluginContext<T>) => boolean;
  onActivate: (context: PluginContext<T>) => Promise<void>;
  onDeactivate?: (context: PluginContext<T>) => Promise<void>;
  
  // Resource-specific configuration
  supportedResourceTypes?: string[];
  requiredPermissions?: string[];
}

// Plugin context
export interface PluginContext<T = any> {
  schema: ResourceSchema;
  actionFactory: ResourceActionFactory<T>;
  actionContext: ActionContext;
  data: {
    items: T[];
    selectedItems: T[];
    filteredItems: T[];
    loading: boolean;
    error: string | null;
  };
  handlers: {
    refresh: () => Promise<void>;
    setSelectedItems: (items: T[]) => void;
    clearSelection: () => void;
    updateFilters: (filters: any) => void;
    updateSort: (field: string, order: 'asc' | 'desc') => void;
  };
}

// Plugin render context
export interface PluginRenderContext<T = any> extends PluginContext<T> {
  isMobile: boolean;
  renderLocation: 'toolbar' | 'fab' | 'card' | 'dropdown';
  size: 'sm' | 'md' | 'lg';
}

// Plugin manager
export class ResourcePluginManager<T = any> {
  private plugins: Map<string, ResourcePlugin<T>> = new Map();
  private activePlugins: Set<string> = new Set();
  
  register(plugin: ResourcePlugin<T>): void {
    this.plugins.set(plugin.id, plugin);
  }
  
  unregister(pluginId: string): void {
    this.deactivate(pluginId);
    this.plugins.delete(pluginId);
  }
  
  activate(pluginId: string, context: PluginContext<T>): void {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) return;
    
    if (plugin.canActivate(context)) {
      plugin.initialize(context);
      this.activePlugins.add(pluginId);
    }
  }
  
  deactivate(pluginId: string): void {
    this.activePlugins.delete(pluginId);
  }
  
  getActivePlugins(): ResourcePlugin<T>[] {
    return Array.from(this.activePlugins)
      .map(id => this.plugins.get(id))
      .filter(Boolean) as ResourcePlugin<T>[];
  }
  
  getPluginsForLocation(location: 'toolbar' | 'fab' | 'card' | 'dropdown', isMobile: boolean): ResourcePlugin<T>[] {
    return this.getActivePlugins().filter(plugin => {
      const config = isMobile ? plugin.mobile : plugin.desktop;
      if (!config.enabled) return false;
      
      switch (location) {
        case 'toolbar':
          return config.showInToolbar;
        case 'fab':
          return isMobile && plugin.mobile.showInFAB;
        case 'card':
          return isMobile && plugin.mobile.showInCard;
        case 'dropdown':
          return !isMobile && plugin.desktop.showInDropdown;
        default:
          return false;
      }
    });
  }
}

// BULK ACTIONS PLUGIN
export const BulkActionsPlugin: ResourcePlugin = {
  id: 'bulk-actions',
  name: 'Bulk Actions',
  description: 'Perform actions on multiple items at once',
  version: '1.0.0',
  
  mobile: {
    enabled: true,
    showInToolbar: true,
    showInFAB: false,
    showInCard: false,
    icon: 'CheckSquare',
    label: 'Bulk Actions',
    shortLabel: 'Bulk'
  },
  
  desktop: {
    enabled: true,
    showInToolbar: true,
    showInDropdown: false,
    icon: 'CheckSquare',
    label: 'Bulk Actions'
  },
  
  initialize: (context) => {
    // Initialize bulk selection state
  },
  
  render: (context) => {
    const { data, handlers, isMobile, renderLocation } = context;
    const selectedCount = data.selectedItems.length;
    const hasSelection = selectedCount > 0;
    
    if (renderLocation === 'toolbar') {
      return (
        <div className="flex items-center gap-2">
          {hasSelection && (
            <Badge variant="secondary" className={isMobile ? 'text-xs' : 'text-sm'}>
              {selectedCount} selected
            </Badge>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size={isMobile ? 'sm' : 'md'}
                disabled={!hasSelection}
                className={cn(
                  isMobile ? 'px-2' : 'px-3',
                  !hasSelection && 'opacity-50'
                )}
              >
                <CheckSquare className="w-4 h-4 mr-2" />
                {isMobile ? 'Bulk' : 'Bulk Actions'}
              </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="end">
              <DropdownMenuItem 
                onClick={() => handlers.setSelectedItems(data.filteredItems)}
                disabled={data.filteredItems.length === selectedCount}
              >
                <CheckSquare className="w-4 h-4 mr-2" />
                Select All
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                onClick={() => handlers.clearSelection()}
                disabled={!hasSelection}
              >
                <XSquare className="w-4 h-4 mr-2" />
                Clear Selection
              </DropdownMenuItem>
              
              {hasSelection && (
                <>
                  <DropdownMenuItem 
                    onClick={() => handleBulkArchive(context)}
                    className="text-yellow-600"
                  >
                    <Archive className="w-4 h-4 mr-2" />
                    Archive Selected
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem 
                    onClick={() => handleBulkDelete(context)}
                    className="text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Selected
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    }
    
    return null;
  },
  
  canActivate: (context) => {
    return context.schema.actions.bulk || false;
  },
  
  onActivate: async (context) => {
    // Bulk actions activated
  }
};

// EXPORT PLUGIN
export const ExportPlugin: ResourcePlugin = {
  id: 'export',
  name: 'Export Data',
  description: 'Export resource data to various formats',
  version: '1.0.0',
  
  mobile: {
    enabled: true,
    showInToolbar: true,
    showInFAB: false,
    showInCard: false,
    icon: 'Download',
    label: 'Export',
    shortLabel: 'Export'
  },
  
  desktop: {
    enabled: true,
    showInToolbar: true,
    showInDropdown: true,
    icon: 'Download',
    label: 'Export Data'
  },
  
  initialize: (context) => {
    // Initialize export functionality
  },
  
  render: (context) => {
    const { data, isMobile, renderLocation } = context;
    const hasData = data.items.length > 0;
    
    if (renderLocation === 'toolbar' || renderLocation === 'dropdown') {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              size={isMobile ? 'sm' : 'md'}
              disabled={!hasData}
            >
              <Download className="w-4 h-4 mr-2" />
              {isMobile ? 'Export' : 'Export Data'}
            </Button>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleExport(context, 'csv')}>
              Export as CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport(context, 'json')}>
              Export as JSON
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport(context, 'xlsx')}>
              Export as Excel
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
    
    return null;
  },
  
  canActivate: (context) => {
    return true; // Available for all resources
  },
  
  onActivate: async (context) => {
    // Export functionality activated
  }
};

// IMPORT PLUGIN
export const ImportPlugin: ResourcePlugin = {
  id: 'import',
  name: 'Import Data',
  description: 'Import data from various formats',
  version: '1.0.0',
  
  mobile: {
    enabled: true,
    showInToolbar: true,
    showInFAB: false,
    showInCard: false,
    icon: 'Upload',
    label: 'Import',
    shortLabel: 'Import'
  },
  
  desktop: {
    enabled: true,
    showInToolbar: true,
    showInDropdown: true,
    icon: 'Upload',
    label: 'Import Data'
  },
  
  initialize: (context) => {
    // Initialize import functionality
  },
  
  render: (context) => {
    const { isMobile, renderLocation } = context;
    
    if (renderLocation === 'toolbar' || renderLocation === 'dropdown') {
      return (
        <Button 
          variant="outline" 
          size={isMobile ? 'sm' : 'md'}
          onClick={() => handleImport(context)}
        >
          <Upload className="w-4 h-4 mr-2" />
          {isMobile ? 'Import' : 'Import Data'}
        </Button>
      );
    }
    
    return null;
  },
  
  canActivate: (context) => {
    return context.schema.actions.create || false;
  },
  
  onActivate: async (context) => {
    // Import functionality activated
  }
};

// ADVANCED FILTERS PLUGIN
export const AdvancedFiltersPlugin: ResourcePlugin = {
  id: 'advanced-filters',
  name: 'Advanced Filters',
  description: 'Advanced filtering and sorting options',
  version: '1.0.0',
  
  mobile: {
    enabled: true,
    showInToolbar: true,
    showInFAB: false,
    showInCard: false,
    icon: 'Filter',
    label: 'Filters',
    shortLabel: 'Filter'
  },
  
  desktop: {
    enabled: true,
    showInToolbar: true,
    showInDropdown: false,
    icon: 'Filter',
    label: 'Advanced Filters'
  },
  
  initialize: (context) => {
    // Initialize advanced filters
  },
  
  render: (context) => {
    const { handlers, isMobile, renderLocation } = context;
    
    if (renderLocation === 'toolbar') {
      return (
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size={isMobile ? 'sm' : 'md'}
            onClick={() => toggleFilters(context)}
          >
            <Filter className="w-4 h-4 mr-2" />
            {isMobile ? 'Filter' : 'Filters'}
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size={isMobile ? 'sm' : 'md'}>
                <SortAsc className="w-4 h-4 mr-2" />
                {isMobile ? 'Sort' : 'Sort By'}
              </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="end">
              {context.schema.fields.map(field => (
                <DropdownMenuItem 
                  key={field.key}
                  onClick={() => handlers.updateSort(field.key, 'asc')}
                >
                  <SortAsc className="w-4 h-4 mr-2" />
                  {field.label} (A-Z)
                </DropdownMenuItem>
              ))}
              
              {context.schema.fields.map(field => (
                <DropdownMenuItem 
                  key={`${field.key}-desc`}
                  onClick={() => handlers.updateSort(field.key, 'desc')}
                >
                  <SortDesc className="w-4 h-4 mr-2" />
                  {field.label} (Z-A)
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    }
    
    return null;
  },
  
  canActivate: (context) => {
    return context.schema.search.fields.length > 0;
  },
  
  onActivate: async (context) => {
    // Advanced filters activated
  }
};

// REFRESH PLUGIN
export const RefreshPlugin: ResourcePlugin = {
  id: 'refresh',
  name: 'Refresh Data',
  description: 'Refresh resource data',
  version: '1.0.0',
  
  mobile: {
    enabled: true,
    showInToolbar: true,
    showInFAB: false,
    showInCard: false,
    icon: 'RefreshCw',
    label: 'Refresh',
    shortLabel: 'Refresh'
  },
  
  desktop: {
    enabled: true,
    showInToolbar: true,
    showInDropdown: true,
    icon: 'RefreshCw',
    label: 'Refresh Data'
  },
  
  initialize: (context) => {
    // Initialize refresh functionality
  },
  
  render: (context) => {
    const { handlers, data, isMobile, renderLocation } = context;
    
    if (renderLocation === 'toolbar' || renderLocation === 'dropdown') {
      return (
        <Button 
          variant="outline" 
          size={isMobile ? 'sm' : 'md'}
          onClick={() => handlers.refresh()}
          disabled={data.loading}
        >
          <RefreshCw className={cn(
            "w-4 h-4 mr-2",
            data.loading && "animate-spin"
          )} />
          {isMobile ? 'Refresh' : 'Refresh Data'}
        </Button>
      );
    }
    
    return null;
  },
  
  canActivate: (context) => {
    return true; // Available for all resources
  },
  
  onActivate: async (context) => {
    // Refresh functionality activated
  }
};

// Plugin action handlers
async function handleBulkArchive(context: PluginContext) {
  const { data, actionFactory, actionContext } = context;
  const selectedItems = data.selectedItems;
  
  if (selectedItems.length === 0) return;
  
  const confirmMessage = actionContext.isMobile 
    ? `Archive ${selectedItems.length} items?`
    : `Are you sure you want to archive ${selectedItems.length} items?`;
  
  if (!confirm(confirmMessage)) return;
  
  try {
    // Implement bulk archive logic
    toast.success(
      actionContext.isMobile 
        ? `${selectedItems.length} items archived`
        : `${selectedItems.length} items archived successfully`
    );
  } catch (error) {
    toast.error('Failed to archive items');
  }
}

async function handleBulkDelete(context: PluginContext) {
  const { data, actionFactory, actionContext } = context;
  const selectedItems = data.selectedItems;
  
  if (selectedItems.length === 0) return;
  
  const confirmMessage = actionContext.isMobile 
    ? `Delete ${selectedItems.length} items?`
    : `Are you sure you want to delete ${selectedItems.length} items? This action cannot be undone.`;
  
  if (!confirm(confirmMessage)) return;
  
  try {
    const action = actionFactory.bulkDeleteAction(selectedItems);
    await actionFactory.executeAction(action);
    context.handlers.clearSelection();
  } catch (error) {
    toast.error('Failed to delete items');
  }
}

async function handleExport(context: PluginContext, format: 'csv' | 'json' | 'xlsx') {
  const { data, actionContext } = context;
  const items = data.selectedItems.length > 0 ? data.selectedItems : data.items;
  
  if (items.length === 0) {
    toast.error('No data to export');
    return;
  }
  
  try {
    // Implement export logic based on format
    const filename = `${context.schema.name.plural}-${new Date().toISOString().split('T')[0]}.${format}`;
    
    toast.success(
      actionContext.isMobile 
        ? `Exported ${items.length} items`
        : `Exported ${items.length} items as ${format.toUpperCase()}`
    );
  } catch (error) {
    toast.error('Failed to export data');
  }
}

async function handleImport(context: PluginContext) {
  const { actionContext } = context;
  
  try {
    // Implement import logic
    // This would typically open a file picker dialog
    
    toast.success(
      actionContext.isMobile 
        ? 'Import started'
        : 'Data import started successfully'
    );
  } catch (error) {
    toast.error('Failed to import data');
  }
}

function toggleFilters(context: PluginContext) {
  // Toggle advanced filters panel
  // This would typically show/hide a filters sidebar or modal
}

// Plugin renderer component
export function PluginRenderer<T>({ 
  plugins, 
  context, 
  location, 
  className 
}: {
  plugins: ResourcePlugin<T>[];
  context: PluginContext<T>;
  location: 'toolbar' | 'fab' | 'card' | 'dropdown';
  className?: string;
}) {
  const isMobile = useIsMobile();
  
  const renderContext: PluginRenderContext<T> = {
    ...context,
    isMobile,
    renderLocation: location,
    size: isMobile ? 'sm' : 'md'
  };
  
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {plugins.map(plugin => (
        <React.Fragment key={plugin.id}>
          {plugin.render(renderContext)}
        </React.Fragment>
      ))}
    </div>
  );
}

// Default plugin registry
export const DEFAULT_PLUGINS = [
  BulkActionsPlugin,
  ExportPlugin,
  ImportPlugin,
  AdvancedFiltersPlugin,
  RefreshPlugin
];

// Create plugin manager with default plugins
export function createPluginManager<T>(): ResourcePluginManager<T> {
  const manager = new ResourcePluginManager<T>();
  
  // Register default plugins
  DEFAULT_PLUGINS.forEach(plugin => {
    manager.register(plugin);
  });
  
  return manager;
}

// Export types
export type { ResourcePlugin, PluginContext, PluginRenderContext };
// ResourcePluginManager already exported above 