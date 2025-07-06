"use client";

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { ResourceSettingsPage } from '@/components/settings/resource-settings-page';
import { useResource } from '@/lib/hooks/use-resource';
import { StatusFlowEditor } from './status-flow-editor';

interface StatusFlow {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  isDefault?: boolean;
  states: Array<{
    id: string;
    name: string;
    color: string;
    type: string;
  }>;
  issueTypes: Array<{
    id: string;
    name: string;
    color: string;
  }>;
}

export default function WorkspaceStatusFlowsPage() {
  const params = useParams();
  const workspaceUrl = params?.workspaceUrl as string;
  const [selectedFlow, setSelectedFlow] = useState<StatusFlow | null>(null);

  // If editing a specific flow, show the editor
  if (selectedFlow) {
    return (
      <StatusFlowEditor 
        flow={selectedFlow}
        workspaceUrl={workspaceUrl}
        onBack={() => setSelectedFlow(null)}
        onUpdate={() => {
          // Refresh the data when coming back
          setSelectedFlow(null);
        }}
      />
    );
  }

  return (
    <ResourceSettingsPage
      config={{
        endpoint: `/api/workspaces/${workspaceUrl}/status-flows`,
        resourceName: 'status flow',
        title: 'Status Flows',
        description: 'Configure issue workflow states for different issue types',
        maxWidth: '6xl',
        
        fields: [
          {
            key: 'name',
            label: 'Flow Name',
            type: 'text',
            required: true,
            placeholder: 'e.g., Bug Workflow, Feature Development',
            validation: (value) => {
              if (!value) return 'Flow name is required';
              if (value.length > 50) return 'Flow name too long (max 50 characters)';
              return null;
            }
          },
          {
            key: 'description',
            label: 'Description',
            type: 'textarea',
            placeholder: 'Describe this status flow...',
            validation: (value) => {
              if (value && value.length > 200) return 'Description too long (max 200 characters)';
              return null;
            }
          }
        ],
        
        searchFields: ['name', 'description'],
        sortField: 'name',
        sortOrder: 'asc',
        
        actions: ['create', 'update', 'delete', 'duplicate'],
        
        onRowClick: (flow) => setSelectedFlow(flow),
        
        useResourceHook: () => {
          const resourceHook = useResource({
            endpoint: `/api/workspaces/${workspaceUrl}/status-flows`,
            cacheKey: `workspace-${workspaceUrl}-status-flows`
          });
          
          // Override the create function to automatically open the editor
          const originalCreate = resourceHook.create;
          const createWithAutoOpen = async (data: any) => {
            const result = await originalCreate(data);
            // Extract the ID from the result
            const flowId = typeof result === 'string' ? result : result.id;
            // Create a full StatusFlow object with the created data
            const newFlow: StatusFlow = {
              id: flowId,
              name: data.name,
              description: data.description,
              color: data.color,
              icon: data.icon,
              isDefault: data.isDefault || false,
              states: [],
              issueTypes: []
            };
            // Automatically open the editor for the newly created flow
            setSelectedFlow(newFlow);
            return result;
          };
          
          return {
            ...resourceHook,
            create: createWithAutoOpen
          };
        },
        
        mockData: [
          { 
            id: '1', 
            name: 'Bug Workflow', 
            description: 'For tracking and resolving bugs',
            color: '#EF4444',
            icon: 'bug',
            isDefault: false,
            states: [
              { id: '1', name: 'Triage', color: '#F59E0B', type: 'BACKLOG' },
              { id: '2', name: 'In Progress', color: '#3B82F6', type: 'STARTED' },
              { id: '3', name: 'Done', color: '#10B981', type: 'COMPLETED' }
            ],
            issueTypes: [
              { id: '1', name: 'Bug', color: '#EF4444' }
            ]
          },
          { 
            id: '2', 
            name: 'Feature Development', 
            description: 'For new feature development',
            color: '#6B7280',
            icon: 'workflow',
            isDefault: true,
            states: [
              { id: '4', name: 'Backlog', color: '#6B7280', type: 'BACKLOG' },
              { id: '5', name: 'In Progress', color: '#3B82F6', type: 'STARTED' },
              { id: '6', name: 'Review', color: '#F59E0B', type: 'STARTED' },
              { id: '7', name: 'Done', color: '#10B981', type: 'COMPLETED' }
            ],
            issueTypes: [
              { id: '2', name: 'Task', color: '#8B5CF6' }
            ]
          },
          { 
            id: '3', 
            name: 'Simple Flow', 
            description: 'Basic workflow with minimal states',
            color: '#10B981',
            icon: 'check',
            isDefault: false,
            states: [
              { id: '8', name: 'Todo', color: '#6B7280', type: 'UNSTARTED' },
              { id: '9', name: 'Done', color: '#10B981', type: 'COMPLETED' }
            ],
            issueTypes: []
          }
        ]
      }}
    />
  );
} 