"use client";

import { useState } from 'react';
import { ResourceSchema } from '@/lib/resource-system/schemas';
import { useActionClient, resourceHooks } from '@/lib/hooks/use-action-api';
import { useCurrentWorkspace } from '@/lib/hooks/use-current-workspace';
import { SettingsTable, SettingsTableColumn } from '@/components/ui/settings-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';
import { BaseResource } from '@/lib/types';
import { toast } from 'sonner';
import { ResourceForm } from './resource-form';
import { cn } from '@/lib/utils';
import { renderIconColumn } from '@/lib/resource-system/icon-renderers';

// Props for schema-based resources
interface SchemaProps {
  schema: ResourceSchema;
  config?: never;
  title?: never;
  description?: never;
}

// Props for config-based resources (legacy)
interface ConfigProps {
  config: {
    customEditor?: React.ComponentType<any>;
    displayName?: string;
    name?: string;
    key?: string;
    endpoint?: string;
    actionPrefix?: string;
    displayFields?: Array<{ key: string; label: string; clickable?: boolean; render?: React.ComponentType<any> }>;
    searchFields?: string[];
    createFields?: Array<{ key: string; label: string; type?: string; required?: boolean }>;
    validationSchema?: any;
    [key: string]: any;
  };
  schema?: never;
  title?: string;
  description?: string;
}

type ResourceSettingsPageProps = SchemaProps | ConfigProps;

export function ResourceSettingsPage(props: ResourceSettingsPageProps) {
  const { workspace } = useCurrentWorkspace();
  const [searchQuery, setSearchQuery] = useState('');
  const [showEditor, setShowEditor] = useState(false);
  const [editingResource, setEditingResource] = useState<BaseResource | null>(null);
  
  if (!workspace) {
    return <div>Loading workspace...</div>;
  }

  // Handle schema-based resources
  if (props.schema) {
    return <SchemaBasedResourcePage schema={props.schema} />;
  }

  // Handle config-based resources (legacy)
  if (props.config) {
    const { config, title, description } = props;
    
    // If config has a custom editor, we need to handle the flow differently
    if (config.customEditor) {
      return <ConfigBasedResourcePageWithEditor 
        config={config} 
        title={title} 
        description={description} 
      />;
    }
    
    // Otherwise render standard table view
    return <ConfigBasedResourcePage 
      config={config} 
      title={title} 
      description={description} 
    />;
  }

  return <div>Invalid resource configuration</div>;
}

// Schema-based resource page component
function SchemaBasedResourcePage({ schema }: { schema: ResourceSchema }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editingItem, setEditingItem] = useState<BaseResource | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get the appropriate resource hook based on actionPrefix
  const resourceHook = (resourceHooks as any)[schema.actionPrefix];
  
  if (!resourceHook) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{schema.display.title}</h1>
          <p className="text-muted-foreground">{schema.display.description}</p>
        </div>
        <div className="text-sm text-muted-foreground">
          Resource hook not found for "{schema.actionPrefix}". Available hooks: {Object.keys(resourceHooks).join(', ')}
        </div>
      </div>
    );
  }

  const { data: items = [], isLoading, error } = resourceHook.useList();
  const createMutation = resourceHook.useCreate();
  const updateMutation = resourceHook.useUpdate();
  const deleteMutation = resourceHook.useDelete();

  // Convert schema fields to table columns with responsive control
  const columns: SettingsTableColumn[] = schema.fields
    .filter(field => {
      // Show column only if explicitly set to true for desktop or mobile
      const showOnDesktop = field.desktop?.showInTable === true;
      const showOnMobile = field.mobile?.showInTable === true;
      return showOnDesktop || showOnMobile;
    })
    .map(field => ({
      key: field.key,
      label: field.label,
      editable: false, // Disable inline editing since we have dedicated form
      type: field.type as any,
      options: Array.isArray(field.options) ? field.options.map(opt => ({ value: opt.value, label: opt.label })) : undefined,
      clickable: field.clickable || false, // Enable column click for editing
      // Add icon renderer for icon fields
      render: field.type === 'icon' ? renderIconColumn : undefined,
      // Enhanced column configuration
      width: field.desktop?.tableWidth || field.desktop?.width || 'auto',
      sortable: field.desktop?.sortable !== false,
      filterable: field.desktop?.filterable || false,
      mobileWidth: field.mobile?.tableWidth || 'auto',
      showOnMobile: field.mobile?.showInTable === true,
      showOnDesktop: field.desktop?.showInTable === true,
      mobileFormat: field.mobile?.displayFormat || 'text'
    }));

  // Filter items based on search
  const filteredItems = items.filter((item: any) => {
    if (!searchQuery) return true;
    return schema.search.fields.some(field => 
      item[field]?.toString().toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Handle form actions
  const handleCreate = () => {
    setFormMode('create');
    setEditingItem(null);
    setShowForm(true);
  };

  const handleEdit = (item: BaseResource) => {
    setFormMode('edit');
    setEditingItem(item);
    setShowForm(true);
  };

  const handleFormSubmit = async (data: Partial<BaseResource>) => {
    console.log('🔄 Form submit triggered:', { formMode, editingItem, data });
    setIsSubmitting(true);
    
    let operationSuccessful = false;
    
    try {
      if (formMode === 'create') {
        console.log('📝 Creating resource:', data);
        const result = await createMutation.create(data);
        console.log('✅ Create result:', result);
        toast.success(`${schema.name.singular} created successfully`);
        operationSuccessful = true;
      } else if (editingItem) {
        console.log('✏️ Updating resource:', { id: editingItem.id, data });
        const result = await updateMutation.update(editingItem.id, data);
        console.log('✅ Update result:', result);
        toast.success(`${schema.name.singular} updated successfully`);
        operationSuccessful = true;
      }
    } catch (error: any) {
      console.error('❌ CRUD operation failed:', error);
      toast.error(`Failed to ${formMode} ${schema.name.singular.toLowerCase()}: ${error.message}`);
    } finally {
      setIsSubmitting(false);
      
      // Always close the form, whether successful or not
      // This ensures the form doesn't get stuck open
      console.log('🔄 Closing form...', { operationSuccessful });
      setShowForm(false);
      setEditingItem(null);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingItem(null);
  };

  const handleDelete = async (item: BaseResource) => {
    try {
      await deleteMutation.delete(item.id);
      toast.success(`${schema.name.singular} deleted successfully`);
    } catch (error: any) {
      toast.error(`Failed to delete ${schema.name.singular.toLowerCase()}: ${error.message}`);
    }
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{schema.display.title}</h1>
          <p className="text-muted-foreground">{schema.display.description}</p>
        </div>
        <div className="text-sm text-red-600">
          Error loading {schema.name.plural.toLowerCase()}: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{schema.display.title}</h1>
        <p className="text-muted-foreground">{schema.display.description}</p>
      </div>
      
      {/* Search and Add Button */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={schema.search.placeholder || `Search ${schema.name.plural.toLowerCase()}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {schema.actions.create && (
          <Button
            onClick={handleCreate}
            className="bg-black hover:bg-black/90"
            disabled={showForm}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add {schema.name.singular}
          </Button>
        )}
      </div>

      {/* Sliding Form Container */}
      <div className={cn(
        "transition-all duration-300 ease-in-out overflow-hidden",
        showForm ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
      )}>
        {showForm && (
          <ResourceForm
            schema={schema}
            mode={formMode}
            initialData={editingItem || {}}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
            isSubmitting={isSubmitting}
            className="mb-6"
            resourceHooks={resourceHooks}
          />
        )}
      </div>

      {/* Table Container with Sliding Effect */}
      <div className={cn(
        "transition-all duration-300 ease-in-out",
        showForm ? "transform translate-y-0" : ""
      )}>
        <SettingsTable
          columns={columns}
          data={filteredItems}
          onEdit={handleEdit}
          onDelete={handleDelete}
          emptyMessage={`No ${schema.name.plural.toLowerCase()} found`}
          createRowConfig={{ enabled: false }} // Disable inline create since we have dedicated form
        />
      </div>
      
      {isLoading && (
        <div className="text-center py-4">
          <div className="text-sm text-muted-foreground">Loading {schema.name.plural.toLowerCase()}...</div>
        </div>
      )}
    </div>
  );
}

// Config-based resource page with custom editor
function ConfigBasedResourcePageWithEditor({ 
  config, 
  title, 
  description 
}: { 
  config: ConfigProps['config'];
  title?: string;
  description?: string;
}) {
  const [showTable, setShowTable] = useState(true);
  const [editingResource, setEditingResource] = useState<BaseResource | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Get the appropriate resource hook based on actionPrefix
  const resourceHook = config.actionPrefix ? (resourceHooks as any)[config.actionPrefix] : null;
  
  if (!resourceHook) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {title || config.displayName || config.name || 'Resources'}
          </h1>
          <p className="text-muted-foreground">
            {description || `Manage ${config.displayName || config.name || 'resources'}`}
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          Resource hook not found for "{config.actionPrefix}". Available hooks: {Object.keys(resourceHooks).join(', ')}
        </div>
      </div>
    );
  }

  const { data: items = [], isLoading, error } = resourceHook.useList();
  const createMutation = resourceHook.useCreate();
  const updateMutation = resourceHook.useUpdate();
  const deleteMutation = resourceHook.useDelete();

  const handleCreate = () => {
    setShowTable(false);
    setEditingResource(null);
  };

  const handleEdit = (item: BaseResource) => {
    setShowTable(false);
    setEditingResource(item);
  };

  const handleUpdate = async (item: BaseResource, updates?: Partial<BaseResource>) => {
    if (!updates) return;
    try {
      await updateMutation.update(item.id, updates);
      toast.success(`${config.displayName || config.name || 'Resource'} updated successfully`);
    } catch (error: any) {
      toast.error(`Failed to update ${config.displayName || config.name || 'resource'}: ${error.message}`);
    }
  };

  const handleDelete = async (item: BaseResource) => {
    try {
      await deleteMutation.delete(item.id);
      toast.success(`${config.displayName || config.name || 'Resource'} deleted successfully`);
    } catch (error: any) {
      toast.error(`Failed to delete ${config.displayName || config.name || 'resource'}: ${error.message}`);
    }
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {title || config.displayName || config.name || 'Resources'}
          </h1>
          <p className="text-muted-foreground">
            {description || `Manage ${config.displayName || config.name || 'resources'}`}
          </p>
        </div>
        <div className="text-sm text-red-600">
          Error loading {config.displayName || config.name || 'resources'}: {error.message}
        </div>
      </div>
    );
  }

  // Filter items based on search
  const filteredItems = items.filter((item: any) => {
    if (!searchQuery) return true;
    return config.searchFields?.some(field => 
      item[field]?.toString().toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Convert config fields to table columns
  const columns: SettingsTableColumn[] = config.displayFields?.map(field => ({
    key: field.key,
    label: field.label,
    render: field.render ? (value: any, item: BaseResource) => {
      const RenderComponent = field.render!;
      return <RenderComponent value={value} item={item} />;
    } : undefined,
    editable: field.key !== 'id',
    type: 'text'
  })) || [];

  if (showTable) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {title || config.displayName || config.name || 'Resources'}
          </h1>
          <p className="text-muted-foreground">
            {description || `Manage ${config.displayName || config.name || 'resources'}`}
          </p>
        </div>
        
        {/* Search */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={`Search ${config.displayName || config.name || 'resources'}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Button onClick={handleCreate} className="bg-black hover:bg-black/90">
            <Plus className="mr-2 h-4 w-4" />
            Add {config.displayName || config.name || 'Resource'}
          </Button>
        </div>

        {/* Table */}
        <SettingsTable
          columns={columns}
          data={filteredItems}
          onEdit={handleUpdate}
          onDelete={handleDelete}
          emptyMessage={`No ${config.displayName || config.name || 'resources'} found`}
        />
        
        {isLoading && (
          <div className="text-center py-4">
            <div className="text-sm text-muted-foreground">Loading...</div>
          </div>
        )}
      </div>
    );
  }

  // Render custom editor
  const CustomEditor = config.customEditor;
  return (
    <div className="space-y-6">
      {CustomEditor && (
        <CustomEditor
          initialData={editingResource}
          onSave={(data: any) => {
            if (editingResource) {
              handleUpdate(editingResource, data);
            } else {
              createMutation.create(data);
            }
            setShowTable(true);
            setEditingResource(null);
          }}
          onCancel={() => {
            setShowTable(true);
            setEditingResource(null);
          }}
        />
      )}
    </div>
  );
}

// Config-based resource page (standard table view)
function ConfigBasedResourcePage({ 
  config, 
  title, 
  description 
}: { 
  config: ConfigProps['config'];
  title?: string;
  description?: string;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Get the appropriate resource hook based on actionPrefix
  const resourceHook = config.actionPrefix ? (resourceHooks as any)[config.actionPrefix] : null;
  
  if (!resourceHook) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {title || config.displayName || config.name || 'Resources'}
          </h1>
          <p className="text-muted-foreground">
            {description || `Manage ${config.displayName || config.name || 'resources'}`}
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          Resource hook not found for "{config.actionPrefix}". Available hooks: {Object.keys(resourceHooks).join(', ')}
        </div>
      </div>
    );
  }

  const { data: items = [], isLoading, error } = resourceHook.useList();
  const createMutation = resourceHook.useCreate();
  const updateMutation = resourceHook.useUpdate();
  const deleteMutation = resourceHook.useDelete();

  const handleCreate = async (data: Partial<BaseResource>) => {
    try {
      await createMutation.create(data);
      toast.success(`${config.displayName || config.name || 'Resource'} created successfully`);
    } catch (error: any) {
      toast.error(`Failed to create ${config.displayName || config.name || 'resource'}: ${error.message}`);
    }
  };

  const handleUpdate = async (item: BaseResource, updates?: Partial<BaseResource>) => {
    if (!updates) return;
    try {
      await updateMutation.update(item.id, updates);
      toast.success(`${config.displayName || config.name || 'Resource'} updated successfully`);
    } catch (error: any) {
      toast.error(`Failed to update ${config.displayName || config.name || 'resource'}: ${error.message}`);
    }
  };

  const handleDelete = async (item: BaseResource) => {
    try {
      await deleteMutation.delete(item.id);
      toast.success(`${config.displayName || config.name || 'Resource'} deleted successfully`);
    } catch (error: any) {
      toast.error(`Failed to delete ${config.displayName || config.name || 'resource'}: ${error.message}`);
    }
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {title || config.displayName || config.name || 'Resources'}
          </h1>
          <p className="text-muted-foreground">
            {description || `Manage ${config.displayName || config.name || 'resources'}`}
          </p>
        </div>
        <div className="text-sm text-red-600">
          Error loading {config.displayName || config.name || 'resources'}: {error.message}
        </div>
      </div>
    );
  }

  // Filter items based on search
  const filteredItems = items.filter((item: any) => {
    if (!searchQuery) return true;
    return config.searchFields?.some(field => 
      item[field]?.toString().toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Convert config fields to table columns
  const columns: SettingsTableColumn[] = config.displayFields?.map(field => ({
    key: field.key,
    label: field.label,
    render: field.render ? (value: any, item: BaseResource) => {
      const RenderComponent = field.render!;
      return <RenderComponent value={value} item={item} />;
    } : undefined,
    editable: field.key !== 'id',
    type: 'text'
  })) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {title || config.displayName || config.name || 'Resources'}
        </h1>
        <p className="text-muted-foreground">
          {description || `Manage ${config.displayName || config.name || 'resources'}`}
        </p>
      </div>
      
      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={`Search ${config.displayName || config.name || 'resources'}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Table */}
      <SettingsTable
        columns={columns}
        data={filteredItems}
        onEdit={handleUpdate}
        onDelete={handleDelete}
        onCreate={handleCreate}
        createRowConfig={{ enabled: true }}
        emptyMessage={`No ${config.displayName || config.name || 'resources'} found`}
      />
      
      {isLoading && (
        <div className="text-center py-4">
          <div className="text-sm text-muted-foreground">Loading...</div>
        </div>
      )}
    </div>
  );
} 