import React from 'react';
import { FieldSetEditor } from '@/components/field-sets/field-set-editor';
import { BaseResource } from '@/lib/types';
import { resourceHooks } from '@/lib/hooks/use-action-api';
import { toast } from 'sonner';

interface FieldSetEditorWrapperProps {
  resource: BaseResource | null;
  onSave: () => void;
  onCancel: () => void;
}

// FieldConfiguration interface matching the editor's expectations
interface FieldConfiguration {
  fieldKey: string;
  isRequired: boolean;
  showOnSubtask: boolean;
  showOnNewIssue: boolean;
  displayOrder: number;
}

// FieldSetData interface matching the editor's expectations
interface FieldSetData {
  name: string;
  description: string;
  configurations: FieldConfiguration[];
}

export function FieldSetEditorWrapper({ 
  resource, 
  onSave, 
  onCancel 
}: FieldSetEditorWrapperProps) {
  console.log('🔧 FieldSetEditorWrapper - Component rendered');
  console.log('🔧 FieldSetEditorWrapper - resource:', resource);
  console.log('🔧 FieldSetEditorWrapper - resource?.id:', resource?.id);
  
  // Use the fieldSet resource hooks to access the mutations
  const updateFieldSet = resourceHooks.fieldSet.useUpdate();
  const createFieldSet = resourceHooks.fieldSet.useCreate();

  // For new field sets, create a minimal field set object
  const fieldSet: FieldSetData = resource ? {
    name: resource.name || '',
    description: (resource as any).description || '',
    configurations: (resource as any).configurations || []
  } : {
    name: '',
    description: '',
    configurations: []
  };

  console.log('🔧 FieldSetEditorWrapper - fieldSet object:', fieldSet);

  const handleSave = async (data: FieldSetData) => {
    console.log('🔧 Field Set Editor - handleSave called');
    console.log('🔧 Field Set Editor - resource:', resource);
    console.log('🔧 Field Set Editor - resource?.id:', resource?.id);
    console.log('🔧 Field Set Editor - data:', data);
    console.log('🔧 Field Set Editor - Decision:', resource?.id ? 'Update' : 'Create');
    
    try {
      if (resource?.id) {
        console.log('🔧 Field Set Editor - Taking UPDATE path');
        // Update existing field set - use the correct API
        await updateFieldSet.update(resource.id, data);
        
        toast.success('Field set updated successfully!');
        
        // Close the editor after successful save
        onSave();
      } else {
        console.log('🔧 Field Set Editor - Taking CREATE path');
        // Create new field set
        await createFieldSet.create(data);
        
        toast.success('Field set created successfully!');
        
        // Close the editor after successful save
        onSave();
      }
    } catch (error) {
      console.error('❌ Field Set Editor - Failed to save:', error);
      toast.error('Failed to save field set. Please try again.');
      // Don't close the editor if save failed
    }
  };

  return (
    <div className="fixed left-64 right-0 top-0 bottom-0 bg-background z-50 overflow-y-auto">
      <div className="min-h-full p-6">
        <FieldSetEditor
          fieldSet={fieldSet}
          onSave={handleSave}
          onCancel={onCancel}
        />
      </div>
    </div>
  );
} 