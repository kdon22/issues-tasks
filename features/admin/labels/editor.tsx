import React from 'react';
import { LabelEditor } from '@/app/workspaces/[workspaceUrl]/settings/labels/label-editor';
import { BaseResource } from '@/lib/types';

interface LabelEditorWrapperProps {
  resource: BaseResource | null;
  onSave: () => void;
  onCancel: () => void;
}

export function LabelEditorWrapper({ 
  resource, 
  onSave, 
  onCancel 
}: LabelEditorWrapperProps) {
  return (
    <div className="fixed left-64 right-0 top-0 bottom-0 bg-background z-50 overflow-y-auto">
      <div className="min-h-full">
        <LabelEditor
          onBack={onCancel}
          onUpdate={onSave}
        />
      </div>
    </div>
  );
} 