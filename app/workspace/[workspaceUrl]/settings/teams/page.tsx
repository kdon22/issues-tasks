"use client";

import { useParams } from 'next/navigation';
import { ResourceSettingsPage } from '@/components/settings/resource-settings-page';
import { useResource } from '@/lib/hooks/use-resource';

export default function TeamsSettingsPage() {
  const params = useParams();
  const workspaceUrl = params?.workspaceUrl as string;

  return (
    <ResourceSettingsPage
      config={{
        endpoint: `/api/workspaces/${workspaceUrl}/teams`,
        resourceName: 'teams',
        title: 'Teams',
        description: 'Create and manage teams within your workspace',
        maxWidth: '6xl',
        
        fields: [
          {
            key: 'name',
            label: 'Team Name',
            type: 'text',
            required: true,
            placeholder: 'Enter team name'
          },
          {
            key: 'identifier',
            label: 'Team Identifier',
            type: 'text',
            required: true,
            placeholder: 'ENG',
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
            placeholder: 'Describe the team purpose'
          },
          {
            key: 'avatarColor',
            label: 'Team Color',
            type: 'color'
          }
        ],
        
        searchFields: ['name', 'identifier', 'description'],
        sortField: 'name',
        
        actions: ['create', 'update', 'delete'],
        editableField: 'name', // Make name column clickable to edit
        
        useResourceHook: () => useResource({
          endpoint: `/api/workspaces/${workspaceUrl}/teams`,
          cacheKey: `workspace-${workspaceUrl}-teams`
        })
      }}
    />
  );
} 