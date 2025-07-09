"use client";

import { useState } from 'react';
import { FieldSetEditor } from './field-set-editor';
import { ResourceSettingsPage } from '@/components/settings/resource-settings-page';

interface FieldSet {
  id: string;
  name: string;
  description?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
  configurations?: FieldConfiguration[];
}

interface FieldConfiguration {
  id: string;
  fieldKey: string;
  isRequired: boolean;
  isVisible: boolean;
  showOnSubtask: boolean;
  showOnNewIssue: boolean;
  displayOrder: number;
}

interface FieldSetsManagerProps {
  workspaceUrl: string;
}

export function FieldSetsManager({ workspaceUrl }: FieldSetsManagerProps) {
  const [selectedFieldSet, setSelectedFieldSet] = useState<FieldSet | null>(null);
  
  // Show editor when a field set is selected
  if (selectedFieldSet) {
    return (
      <FieldSetEditor 
        fieldSet={{
          name: selectedFieldSet.name,
          description: selectedFieldSet.description || '',
          configurations: selectedFieldSet.configurations || []
        }}
        onSave={async (data) => {
          // TODO: Implement save logic
          setSelectedFieldSet(null);
        }}
        onCancel={() => setSelectedFieldSet(null)}
      />
    );
  }
  
  // TODO: This component needs to be updated to use the new action-based ResourceSettingsPage
  // For now, return a placeholder since the old config format is no longer supported
  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Field Sets</h2>
      <p className="text-gray-600">
        This component is being migrated to the new action-based system. 
        Please check back later.
      </p>
    </div>
  );
  
  /* OLD CODE - TODO: Convert to new ResourceSettingsPage format
  // Resource settings page configuration
  const resourceConfig = {
    endpoint: `/api/workspaces/${workspaceUrl}/field-sets`,
    resourceName: 'Field Set',
    title: 'Field Sets',
    description: 'Manage field sets for your workspace',
    maxWidth: 'full' as const,
    
    fields: [
      {
        key: 'name',
        label: 'Name',
        type: 'text' as const,
        required: true,
        placeholder: 'Enter field set name'
      },
      {
        key: 'description',
        label: 'Description',
        type: 'textarea' as const,
        placeholder: 'Enter field set description'
      },
      {
        key: 'isDefault',
        label: 'Default',
        type: 'switch' as const
      }
    ],
    
         actions: ['create', 'update', 'delete'] as ('create' | 'update' | 'delete')[],
    
    onRowClick: (fieldSet: FieldSet) => setSelectedFieldSet(fieldSet),
    
    useResourceHook: () => {
      const cachedHook = useCachedResource<FieldSet>({
        resource: 'fieldSets',
        cacheKey: `workspace-${workspaceUrl}-field-sets`,
        optimisticUpdates: true,
        showToasts: true,
        autoSync: true
      });
      
      // Override the create function to automatically open the editor
      const originalCreate = cachedHook.actions.create;
      const createWithAutoOpen = async (data: any) => {
        const result = await originalCreate(data);
        // Create a full FieldSet object with the created data
        const newFieldSet: FieldSet = {
          id: result.id,
          name: data.name,
          description: data.description,
          isDefault: data.isDefault || false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          configurations: []
        };
        // Automatically open the editor for the newly created field set
        setSelectedFieldSet(newFieldSet);
        return result;
      };
      
      return {
        items: cachedHook.state.items,
        loading: cachedHook.state.loading,
        error: cachedHook.state.error,
        create: createWithAutoOpen,
        update: cachedHook.actions.update,
        delete: cachedHook.actions.delete,
        refetch: cachedHook.actions.refetch
      };
    },
    
    canCreate: true,
    canUpdate: true,
    canDelete: true,
  };
  
  return <ResourceSettingsPage config={resourceConfig} />;
  */
} 