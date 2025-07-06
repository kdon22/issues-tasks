"use client";

import { useParams } from 'next/navigation';
import { ResourceSettingsPage } from '@/components/settings/resource-settings-page';
import { useResource } from '@/lib/hooks/use-resource';

export default function WorkspaceSettingsPage() {
  const params = useParams();
  const workspaceUrl = params?.workspaceUrl as string;

  if (!workspaceUrl) {
    return <div>Loading...</div>;
  }

  return (
    <ResourceSettingsPage
      config={{
        endpoint: `/api/workspaces/by-url/${workspaceUrl}`,
        resourceName: 'workspace',
        title: 'Workspace Settings',
        description: 'Configure your workspace preferences',
        maxWidth: '6xl',
        
        fields: [
          {
            key: 'name',
            label: 'Workspace Name',
            type: 'text',
            required: true,
            placeholder: 'Enter workspace name',
          },
          {
            key: 'url',
            label: 'Workspace URL',
            type: 'text',
            required: true,
            placeholder: 'workspace-url',
          },
          {
            key: 'description',
            label: 'Description',
            type: 'textarea',
            placeholder: 'Describe your workspace',
          },
          {
            key: 'avatarType',
            label: 'Avatar Type',
            type: 'select',
            options: [
              { value: 'emoji', label: 'Emoji' },
              { value: 'icon', label: 'Icon' },
              { value: 'color', label: 'Color' },
              { value: 'image', label: 'Image' },
            ],
          },
          {
            key: 'avatarColor',
            label: 'Avatar Color',
            type: 'color',
          },
          {
            key: 'avatarEmoji',
            label: 'Avatar Emoji',
            type: 'text',
            placeholder: '🚀',
          },
          {
            key: 'avatarIcon',
            label: 'Avatar Icon',
            type: 'icon',
          },
          {
            key: 'avatarImageUrl',
            label: 'Avatar Image URL',
            type: 'text',
            placeholder: 'https://...',
          },
          {
            key: 'isPublic',
            label: 'Public Workspace',
            type: 'switch',
          },
          {
            key: 'allowSignup',
            label: 'Allow Signup',
            type: 'switch',
          },
        ],
        
        actions: ['update'],
        editableField: 'name', // Make name column clickable to edit
        
        useResourceHook: () => useResource({
          endpoint: `/api/workspaces/by-url/${workspaceUrl}`,
          cacheKey: `workspace-${workspaceUrl}`
        })
      }}
    />
  );
} 