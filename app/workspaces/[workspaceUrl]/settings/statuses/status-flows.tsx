"use client";

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { ResourceSettingsPage } from '@/components/settings/resource-settings-page';
import { StatusFlowEditor } from './status-flow-editor';

interface StatusFlow {
  id: string;
  name: string;
  description?: string;
  states: Array<{
    id: string;
    name: string;
    color: string;
    type: string;
  }>;
}

export default function StatusFlowsPage() {
  const params = useParams();
  const workspaceUrl = params.workspaceUrl as string;
  const [editingFlow, setEditingFlow] = useState<StatusFlow | null>(null);

  const handleEditFlow = (item: any) => {
    setEditingFlow(item as StatusFlow);
  };

  const handleBackToList = () => {
    setEditingFlow(null);
  };

  const handleFlowUpdate = () => {
    // This will be called when the flow is updated
    // We could refetch the list here if needed
  };

  // If we're editing a flow, show the editor
  if (editingFlow) {
    return (
      <StatusFlowEditor
        flow={editingFlow}
        workspaceUrl={workspaceUrl}
        onBack={handleBackToList}
        onUpdate={handleFlowUpdate}
      />
    );
  }

  // Otherwise, show the list view
  return (
    <ResourceSettingsPage
      config={{
        name: 'Status Flow',
        actionPrefix: 'statusFlow',
        displayFields: ['name', 'description'],
        searchFields: ['name', 'description'],
        createFields: [
          { key: 'name', label: 'Flow Name', type: 'text', required: true },
          { key: 'description', label: 'Description', type: 'textarea' },
          { key: 'position', label: 'Position', type: 'number' }
        ]
      }}
      title="Status Flows"
      description="Manage status flows and their workflow states"
      onEdit={handleEditFlow}
    />
  );
} 