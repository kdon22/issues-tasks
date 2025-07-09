import React from 'react';
import { StatusFlowEditor } from '@/app/workspaces/[workspaceUrl]/settings/statuses/status-flow-editor';
import { useCurrentWorkspace } from '@/lib/hooks/use-current-workspace';
import { BaseResource } from '@/lib/types';

interface StatusFlowEditorWrapperProps {
  resource: BaseResource | null;
  onSave: () => void;
  onCancel: () => void;
}

// StatusFlow interface matching the editor's expectations
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

export function StatusFlowEditorWrapper({ 
  resource, 
  onSave, 
  onCancel 
}: StatusFlowEditorWrapperProps) {
  const { workspace } = useCurrentWorkspace();
  
  if (!workspace) {
    return <div>Loading workspace...</div>;
  }

  // For new status flows, create a minimal flow object
  const flow: StatusFlow = resource ? {
    id: resource.id,
    name: resource.name || '',
    description: (resource as any).description || '',
    states: (resource as any).states || []
  } : {
    id: 'new',
    name: '',
    description: '',
    states: []
  };

  return (
    <StatusFlowEditor
      flow={flow}
      workspaceUrl={workspace.url}
      onBack={onCancel}
      onUpdate={onSave}
    />
  );
} 