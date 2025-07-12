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
import { ArrowLeft, GripVertical, Plus, X, Check, Settings, Eye, EyeOff, Info, Edit2 } from 'lucide-react';

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
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  
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

  // Filter out fields that are already configured or should not be configurable
  const excludedFields = ['status']; // status is managed by status flow
  const availableFields = Object.values(STANDARD_FIELDS).filter(field => 
    !formData.configurations.some(config => config.fieldKey === field.key) &&
    !excludedFields.includes(field.key)
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    setDragOverIndex(null);
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
        displayOrder: 0 // Will be updated below
      };
      
      setFormData(prev => {
        // If dropping on the drop zone itself (not on a specific field), add to end
        if (overId === 'configured-fields') {
          return {
            ...prev,
            configurations: [...prev.configurations, { ...newConfig, displayOrder: prev.configurations.length }]
          };
        }
        
        // If dropping on a specific configured field, insert at that position
        if (overId.startsWith('configured-')) {
          const overIndex = prev.configurations.findIndex(
            config => `configured-${config.fieldKey}` === overId
          );
          
          if (overIndex >= 0) {
            // Insert at the position of the field we're dropping on
            const newConfigurations = [...prev.configurations];
            newConfigurations.splice(overIndex, 0, { ...newConfig, displayOrder: overIndex });
            
            // Update display orders for all fields after the insertion point
            for (let i = overIndex + 1; i < newConfigurations.length; i++) {
              newConfigurations[i].displayOrder = i;
            }
            
            return {
              ...prev,
              configurations: newConfigurations
            };
          }
        }
        
        // Fallback: add to end
        return {
          ...prev,
          configurations: [...prev.configurations, { ...newConfig, displayOrder: prev.configurations.length }]
        };
      });
    }

    // If dragging from configured fields back to available fields
    else if (activeId.startsWith('configured-') && overId === 'available-fields') {
      const fieldKey = activeId.replace('configured-', '');
      
      // Remove the field from configurations
      setFormData(prev => {
        const newConfigurations = prev.configurations.filter(
          config => config.fieldKey !== fieldKey
        );
        
        // Update display orders to maintain consistency
        newConfigurations.forEach((config, index) => {
          config.displayOrder = index;
        });
        
        return {
          ...prev,
          configurations: newConfigurations
        };
      });
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
        setFormData(prev => {
          const newConfigurations = arrayMove(prev.configurations, activeIndex, overIndex);
          
          // Update display orders to maintain consistency
          newConfigurations.forEach((config, index) => {
            config.displayOrder = index;
          });
          
          return {
            ...prev,
            configurations: newConfigurations
          };
        });
      }
    }

    setActiveId(null);
    setDragOverIndex(null);
  }, [formData.configurations]);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setDragOverIndex(null);
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    // Handle dragging from available fields over configured fields
    if (activeId.startsWith('available-') && (overId === 'configured-fields' || overId.startsWith('configured-'))) {
      if (overId.startsWith('configured-')) {
        const overIndex = formData.configurations.findIndex(
          config => `configured-${config.fieldKey}` === overId
        );
        
        if (overIndex >= 0) {
          setDragOverIndex(overIndex);
          return;
        }
      } else {
        // Dropping at the end
        setDragOverIndex(formData.configurations.length);
      }
      return;
    }
    
    // Clear drag over index for other cases
    setDragOverIndex(null);
  }, [formData.configurations]);

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
      console.error('❌ Field Set Editor - Save failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const draggedField = activeId ? STANDARD_FIELDS[activeId.replace(/^(available|configured)-/, '')] : null;

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="h-4 w-px bg-border" />
          {editingFieldSetInfo ? (
            <div className="flex items-center gap-2">
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Field set name"
                className="w-48"
              />
              <Button onClick={handleUpdateFieldSetInfo} size="sm">
                <Check className="w-4 h-4" />
              </Button>
              <Button onClick={() => setEditingFieldSetInfo(false)} variant="outline" size="sm">
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold">{formData.name || 'Untitled Field Set'}</h1>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingFieldSetInfo(true)}
              >
                <Edit2 className="w-4 h-4" />
              </Button>
            </div>
          )}
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
      {editingFieldSetInfo ? (
        <div className="space-y-2">
          <label className="text-sm font-medium">Description</label>
          <Input
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Describe what this field set is used for..."
            className="max-w-md"
          />
        </div>
      ) : (
        formData.description && (
          <p className="text-sm text-muted-foreground">{formData.description}</p>
        )
      )}

      {/* Drag & Drop Interface */}
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
      >
        <div className="grid grid-cols-[300px_1fr] gap-6">
          {/* Available Fields */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Available Fields</h3>
            <div className="space-y-6">
              {Object.entries(FIELD_CATEGORIES).map(([categoryKey, category]) => {
                const categoryFields = getFieldsByCategory(categoryKey as FieldCategory).filter(field =>
                  availableFields.includes(field)
                );
                
                if (categoryFields.length === 0) return null;

                return (
                  <div key={categoryKey} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        <span className="text-sm font-medium text-muted-foreground">
                          {categoryFields.length}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium">{category.label}</h4>
                        <p className="text-sm text-muted-foreground">{category.description}</p>
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
            <h3 className="text-lg font-semibold">Field Configuration</h3>
            <div className="sticky top-6">
              <DropZone id="configured-fields">
                <SortableContext
                  items={configuredFields.map(item => `configured-${item.fieldKey}`)}
                  strategy={verticalListSortingStrategy}
                >
                  {configuredFields.length === 0 && dragOverIndex === null ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Drag fields here to configure them</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {configuredFields.map((item, index) => (
                        <div key={item.fieldKey} className="transition-all duration-200">
                          {/* Show insertion placeholder */}
                          {dragOverIndex === index && activeId?.startsWith('available-') && (
                            <div className="h-12 bg-blue-100 dark:bg-blue-900/30 border-2 border-dashed border-blue-400 dark:border-blue-500 rounded flex items-center justify-center transition-all duration-200 animate-pulse mb-2">
                              <span className="text-blue-600 dark:text-blue-400 text-sm font-medium">
                                Drop here to insert
                              </span>
                            </div>
                          )}
                          <ConfiguredField
                            field={item.field}
                            configuration={item}
                            onUpdate={(updates) => updateFieldConfig(item.fieldKey, updates)}
                            onRemove={() => removeField(item.fieldKey)}
                          />
                        </div>
                      ))}
                      {/* Show insertion placeholder at the end */}
                      {dragOverIndex === configuredFields.length && activeId?.startsWith('available-') && (
                        <div className="h-12 bg-blue-100 dark:bg-blue-900/30 border-2 border-dashed border-blue-400 dark:border-blue-500 rounded flex items-center justify-center transition-all duration-200 animate-pulse">
                          <span className="text-blue-600 dark:text-blue-400 text-sm font-medium">
                            Drop here to add at end
                          </span>
                        </div>
                      )}
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
            <div className="bg-background border rounded-lg p-2 shadow-lg">
              <div className="flex items-center gap-2">
                <div className="text-muted-foreground">
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
            "flex items-center gap-2 p-1.5 rounded border cursor-grab active:cursor-grabbing",
            "hover:bg-muted/25 transition-colors",
            isDragging && "opacity-50",
            "border-border"
          )}
        >
          <div className="text-muted-foreground text-xs">
            {field.icon}
          </div>
          <div className="flex-1">
            <div className="font-medium text-xs">{field.label}</div>
          </div>
          {field.required && (
            <Badge variant="secondary" className="text-xs px-1 py-0">Required</Badge>
          )}
          <Info className="w-3 h-3 text-muted-foreground" />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-2">
          <div className="font-medium">{field.label}</div>
          <div className="text-sm text-muted-foreground">{field.description}</div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
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
        "flex items-center gap-2 p-1.5 bg-background border rounded transition-all duration-200",
        isDragging && "opacity-50"
      )}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
      >
        <GripVertical className="w-3 h-3" />
      </div>
      
      <div className="flex-1 flex items-center gap-2">
        <div className="text-muted-foreground text-xs">
          {field.icon}
        </div>
        <div className="font-medium text-xs">{field.label}</div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <Switch
            checked={configuration.isRequired}
            onCheckedChange={(checked) => onUpdate({ isRequired: checked })}
          />
          <span className="text-xs text-muted-foreground">Required</span>
        </div>
        
        <div className="flex items-center gap-1">
          <Switch
            checked={configuration.showOnNewIssue}
            onCheckedChange={(checked) => onUpdate({ showOnNewIssue: checked })}
          />
          <span className="text-xs text-muted-foreground">New Issue</span>
        </div>
        
        <div className="flex items-center gap-1">
          <Switch
            checked={configuration.showOnSubtask}
            onCheckedChange={(checked) => onUpdate({ showOnSubtask: checked })}
          />
          <span className="text-xs text-muted-foreground">Subtask</span>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="text-red-500 hover:text-red-700 p-1"
        >
          <X className="w-3 h-3" />
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
          : "border-border"
      )}>
        {children}
      </div>
    </div>
  );
} 