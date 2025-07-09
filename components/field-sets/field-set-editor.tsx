"use client";

import { useState, useCallback } from 'react';
import { DndContext, DragEndEvent, DragOverEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors, useDroppable } from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { FIELD_CATEGORIES, STANDARD_FIELDS, getFieldsByCategory, FieldType, FieldCategory } from '@/lib/field-types/registry';
import { cn } from '@/lib/utils';
import { ArrowLeft, GripVertical, Plus, X, Check, Settings, Eye, EyeOff, Info } from 'lucide-react';

interface FieldConfiguration {
  fieldKey: string;
  isRequired: boolean;
  showOnSubtask: boolean;
  showOnNewIssue: boolean;
  displayOrder: number;
}

interface FieldSetData {
  name: string;
  description: string;
  configurations: FieldConfiguration[];
}

interface FieldSetEditorProps {
  fieldSet?: FieldSetData;
  onSave: (data: FieldSetData) => Promise<void>;
  onCancel: () => void;
}

export function FieldSetEditor({ fieldSet, onSave, onCancel }: FieldSetEditorProps) {
  const [formData, setFormData] = useState<FieldSetData>({
    name: fieldSet?.name || '',
    description: fieldSet?.description || '',
    configurations: fieldSet?.configurations || []
  });
  
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingFieldSetInfo, setEditingFieldSetInfo] = useState(false);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const configuredFields = formData.configurations.map(config => ({
    ...config,
    field: STANDARD_FIELDS[config.fieldKey]
  })).filter(item => item.field);

  // Filter out only the fields that are truly always present - everything else should be configurable
  const alwaysPresentFields = ['title', 'description', 'state'];
  const availableFields = Object.values(STANDARD_FIELDS).filter(field => 
    !formData.configurations.some(config => config.fieldKey === field.key) &&
    !alwaysPresentFields.includes(field.key) // Remove only the truly always present fields
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveId(null);
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    // If dragging from available fields to configured fields
    if (activeId.startsWith('available-') && (overId === 'configured-fields' || overId.startsWith('configured-'))) {
      const fieldKey = activeId.replace('available-', '');
      const newConfig: FieldConfiguration = {
        fieldKey,
        isRequired: STANDARD_FIELDS[fieldKey]?.required || false,
        showOnSubtask: true,
        showOnNewIssue: true,
        displayOrder: formData.configurations.length
      };
      
      setFormData(prev => ({
        ...prev,
        configurations: [...prev.configurations, newConfig]
      }));
    }

    // If reordering within configured fields
    else if (activeId.startsWith('configured-') && overId.startsWith('configured-')) {
      const activeIndex = formData.configurations.findIndex(
        config => `configured-${config.fieldKey}` === activeId
      );
      const overIndex = formData.configurations.findIndex(
        config => `configured-${config.fieldKey}` === overId
      );

      if (activeIndex !== overIndex) {
        setFormData(prev => ({
          ...prev,
          configurations: arrayMove(prev.configurations, activeIndex, overIndex)
        }));
      }
    }

    setActiveId(null);
  }, [formData.configurations]);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Allow dropping available fields onto configured fields area
    if (activeId.startsWith('available-') && (overId === 'configured-fields' || overId.startsWith('configured-'))) {
      return;
    }
  }, []);

  const removeField = useCallback((fieldKey: string) => {
    setFormData(prev => ({
      ...prev,
      configurations: prev.configurations.filter(config => config.fieldKey !== fieldKey)
    }));
  }, []);

  const updateFieldConfig = useCallback((fieldKey: string, updates: Partial<FieldConfiguration>) => {
    setFormData(prev => ({
      ...prev,
      configurations: prev.configurations.map(config =>
        config.fieldKey === fieldKey ? { ...config, ...updates } : config
      )
    }));
  }, []);

  const handleUpdateFieldSetInfo = async () => {
    if (!formData.name.trim()) return;
    setEditingFieldSetInfo(false);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Failed to save field set:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const draggedField = activeId ? STANDARD_FIELDS[activeId.replace(/^(available|configured)-/, '')] : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <div className="flex items-center gap-2">
              {editingFieldSetInfo ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="text-2xl font-bold border-0 p-0 h-auto bg-transparent"
                    placeholder="Field Set Name"
                    onBlur={handleUpdateFieldSetInfo}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleUpdateFieldSetInfo();
                      }
                    }}
                    autoFocus
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleUpdateFieldSetInfo}
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <h1 
                  className="text-2xl font-bold text-slate-900 dark:text-white cursor-pointer hover:text-slate-700 dark:hover:text-slate-200"
                  onClick={() => setEditingFieldSetInfo(true)}
                >
                  {formData.name || 'Untitled Field Set'}
                </h1>
              )}
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              Configure which fields appear in your issue forms
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !formData.name.trim()}>
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Saving...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Save Field Set
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Field Set Description */}
      {editingFieldSetInfo && (
        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
          <label className="block text-sm font-medium mb-2">Description (optional)</label>
          <Input
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Describe what this field set is used for"
          />
        </div>
      )}

      {/* Drag & Drop Interface */}
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
      >
        <div className="grid grid-cols-2 gap-6">
          {/* Available Fields */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Available Fields</h3>
            <div className="space-y-6">
              {Object.entries(FIELD_CATEGORIES).map(([categoryKey, category]) => {
                const categoryFields = getFieldsByCategory(categoryKey as FieldCategory).filter(field =>
                  availableFields.includes(field)
                );
                
                if (categoryFields.length === 0) return null;

                return (
                  <div key={categoryKey} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                          {categoryFields.length}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-900 dark:text-white">{category.label}</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{category.description}</p>
                      </div>
                    </div>
                    
                    <div className="ml-10 space-y-1">
                      {categoryFields.map(field => (
                        <DraggableField
                          key={field.key}
                          field={field}
                          id={`available-${field.key}`}
                          type="available"
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Configured Fields */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Field Configuration</h3>
            <div className="sticky top-6">
              <DropZone id="configured-fields">
                <SortableContext
                  items={configuredFields.map(item => `configured-${item.fieldKey}`)}
                  strategy={verticalListSortingStrategy}
                >
                  {configuredFields.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                      <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Drag fields here to configure them</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {configuredFields.map(item => (
                        <ConfiguredField
                          key={item.fieldKey}
                          field={item.field}
                          configuration={item}
                          onUpdate={(updates) => updateFieldConfig(item.fieldKey, updates)}
                          onRemove={() => removeField(item.fieldKey)}
                        />
                      ))}
                    </div>
                  )}
                </SortableContext>
              </DropZone>
            </div>
          </div>
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {draggedField && (
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 shadow-lg">
              <div className="flex items-center gap-2">
                <div className="text-slate-500 dark:text-slate-400">
                  {draggedField.icon}
                </div>
                <div>
                  <div className="font-medium text-sm">{draggedField.label}</div>
                </div>
              </div>
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

// Draggable field component - thinner design
function DraggableField({ field, id, type }: { field: FieldType; id: string; type: 'available' | 'configured' }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div
          ref={setNodeRef}
          style={style}
          {...attributes}
          {...listeners}
          className={cn(
            "flex items-center gap-2 p-2 rounded-lg border cursor-grab active:cursor-grabbing",
            "hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors",
            isDragging && "opacity-50",
            "border-slate-200 dark:border-slate-700"
          )}
        >
          <div className="text-slate-500 dark:text-slate-400 text-sm">
            {field.icon}
          </div>
          <div className="flex-1">
            <div className="font-medium text-sm">{field.label}</div>
          </div>
          {field.required && (
            <Badge variant="secondary" className="text-xs">Required</Badge>
          )}
          <Info className="w-3 h-3 text-slate-400" />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-2">
          <div className="font-medium">{field.label}</div>
          <div className="text-sm text-slate-600 dark:text-slate-400">{field.description}</div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Badge variant="outline">{field.category}</Badge>
            <Badge variant="outline">{field.inputType}</Badge>
            {field.required && <Badge variant="outline">Required</Badge>}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Configured field component - compact design
function ConfiguredField({ 
  field, 
  configuration, 
  onUpdate, 
  onRemove 
}: { 
  field: FieldType; 
  configuration: FieldConfiguration; 
  onUpdate: (updates: Partial<FieldConfiguration>) => void; 
  onRemove: () => void; 
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `configured-${field.key}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-2 p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg",
        isDragging && "opacity-50"
      )}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600"
      >
        <GripVertical className="w-4 h-4" />
      </div>
      
      <div className="flex-1 flex items-center gap-2">
        <div className="text-slate-500 dark:text-slate-400 text-sm">
          {field.icon}
        </div>
        <div className="font-medium text-sm">{field.label}</div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <Switch
            checked={configuration.isRequired}
            onCheckedChange={(checked) => onUpdate({ isRequired: checked })}
          />
          <span className="text-xs text-slate-500">Required</span>
        </div>
        
        <div className="flex items-center gap-1">
          <Switch
            checked={configuration.showOnNewIssue}
            onCheckedChange={(checked) => onUpdate({ showOnNewIssue: checked })}
          />
          <span className="text-xs text-slate-500">New Issue</span>
        </div>
        
        <div className="flex items-center gap-1">
          <Switch
            checked={configuration.showOnSubtask}
            onCheckedChange={(checked) => onUpdate({ showOnSubtask: checked })}
          />
          <span className="text-xs text-slate-500">Subtask</span>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="text-red-500 hover:text-red-700"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

function DropZone({ id, children }: { id: string; children: React.ReactNode }) {
  const { isOver, setNodeRef } = useDroppable({
    id: id,
  });

  return (
    <div 
      ref={setNodeRef}
      className="w-full"
    >
      <div className={cn(
        "border-2 border-dashed rounded-lg p-4 min-h-[400px] transition-colors",
        isOver 
          ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-500" 
          : "border-slate-200 dark:border-slate-700"
      )}>
        {children}
      </div>
    </div>
  );
} 