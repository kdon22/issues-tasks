"use client";

import { useParams } from 'next/navigation';
import { ResourceSettingsPage } from '@/components/settings/resource-settings-page';
import { useResource } from '@/lib/hooks/use-resource';

// Predefined color options for labels
const LABEL_COLORS = [
  '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16', '#22C55E', 
  '#10B981', '#06B6D4', '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7', 
  '#EC4899', '#F43F5E', '#6B7280', '#374151'
];

export default function LabelsSettingsPage() {
  const params = useParams();
  const workspaceUrl = params?.workspaceUrl as string;

  return (
    <ResourceSettingsPage
      config={{
        endpoint: `/api/workspaces/${workspaceUrl}/labels`,
        resourceName: 'labels',
        title: 'Labels',
        description: 'Organize and categorize your issues with labels',
        maxWidth: '6xl',
        
        fields: [
          {
            key: 'name',
            label: 'Label Name',
            type: 'text',
            required: true,
            placeholder: 'Enter label name',
            validation: (value) => {
              if (!value) return 'Label name is required';
              if (value.length > 50) return 'Label name too long (max 50 characters)';
              return null;
            }
          },
          {
            key: 'color',
            label: 'Label Color',
            type: 'color',
            required: true,
            options: LABEL_COLORS
          },
          {
            key: 'description',
            label: 'Description',
            type: 'textarea',
            placeholder: 'Describe when to use this label'
          }
        ],
        
        searchFields: ['name', 'description'],
        sortField: 'name',
        
        actions: ['create', 'update', 'delete', 'duplicate'],
        editableField: 'name', // Make name column clickable to edit
        
        useResourceHook: () => useResource({
          endpoint: `/api/workspaces/${workspaceUrl}/labels`,
          cacheKey: `workspace-${workspaceUrl}-labels`
        })
      }}
    />
  );
} 