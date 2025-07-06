"use client";

import { useParams } from 'next/navigation';
import { ResourceSettingsPage } from '@/components/settings/resource-settings-page';
import { useResource } from '@/lib/hooks/use-resource';

export default function ProjectsSettingsPage() {
  const params = useParams();
  const workspaceUrl = params?.workspaceUrl as string;

  return (
    <ResourceSettingsPage
      config={{
        endpoint: `/api/workspaces/${workspaceUrl}/projects`,
        resourceName: 'projects',
        title: 'Projects',
        description: 'Create and manage projects within your workspace',
        maxWidth: '6xl',
        
        fields: [
          {
            key: 'name',
            label: 'Project Name',
            type: 'text',
            required: true,
            placeholder: 'Enter project name'
          },
          {
            key: 'identifier',
            label: 'Project Identifier',
            type: 'text',
            required: true,
            placeholder: 'WEB',
            validation: (value) => {
              if (!value) return 'Identifier is required';
              if (!/^[A-Z]{2,10}$/.test(value)) return 'Identifier must be 2-10 uppercase letters';
              return null;
            }
          },
          {
            key: 'description',
            label: 'Description',
            type: 'textarea',
            placeholder: 'Describe the project purpose and goals'
          },
          {
            key: 'color',
            label: 'Project Color',
            type: 'color'
          },
          {
            key: 'status',
            label: 'Status',
            type: 'select',
            options: [
              { value: 'ACTIVE', label: 'Active' },
              { value: 'PAUSED', label: 'Paused' },
              { value: 'COMPLETED', label: 'Completed' },
              { value: 'CANCELED', label: 'Canceled' }
            ]
          },
          {
            key: 'startDate',
            label: 'Start Date',
            type: 'text',
            placeholder: 'YYYY-MM-DD'
          },
          {
            key: 'targetDate',
            label: 'Target Date',
            type: 'text',
            placeholder: 'YYYY-MM-DD'
          },
          {
            key: 'leadUserId',
            label: 'Project Lead',
            type: 'select',
            placeholder: 'Select project lead',
            // Note: In a real implementation, this would be populated with workspace users
            options: []
          },
          {
            key: 'teamId',
            label: 'Team',
            type: 'select',
            required: true,
            placeholder: 'Select team',
            // Note: In a real implementation, this would be populated with workspace teams
            options: []
          }
        ],
        
        searchFields: ['name', 'identifier', 'description'],
        sortField: 'name',
        
        actions: ['create', 'update', 'delete'],
        editableField: 'name', // Make name column clickable to edit
        
        useResourceHook: () => useResource({
          endpoint: `/api/workspaces/${workspaceUrl}/projects`,
          cacheKey: `workspace-${workspaceUrl}-projects`
        })
      }}
    />
  );
} 