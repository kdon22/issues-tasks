"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ColorPicker } from '@/components/ui/color-picker';
import { resourceHooks } from '@/lib/hooks/use-action-api';
import { ArrowLeft, Check, X, Edit2, Plus, GripVertical, ChevronDown, ChevronRight, Diamond } from 'lucide-react';
import { toast } from 'sonner';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import {
  CSS,
} from '@dnd-kit/utilities';

interface LabelGroup {
  id: string;
  name: string;
  description?: string;
  color?: string;
  position?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface Label {
  id: string;
  name: string;
  description?: string;
  color?: string;
  groupId?: string;
  position?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface LabelEditorProps {
  onBack: () => void;
  onUpdate: () => void;
}

// Diamond shape component for group labels
function DiamondShape({ color, size = 16 }: { color: string; size?: number }) {
  return (
    <div 
      className="inline-block transform rotate-45 border"
      style={{ 
        width: `${size}px`, 
        height: `${size}px`,
        backgroundColor: color,
        borderColor: color
      }}
    />
  );
}

// Flattened item type for the tree structure
type FlattenedItem = {
  id: string;
  type: 'group' | 'label';
  level: number;
  data: LabelGroup | Label;
  groupId?: string;
};

export function LabelEditor({ onBack, onUpdate }: LabelEditorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingLabelId, setEditingLabelId] = useState<string | null>(null);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [creatingInGroup, setCreatingInGroup] = useState<string | null>(null);
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Use resource hooks for labels and label groups
  const { data: labels = [], isLoading: labelsLoading } = resourceHooks.label.useList();
  const { data: groups = [], isLoading: groupsLoading } = resourceHooks.labelGroup.useList();
  const labelCreate = resourceHooks.label.useCreate();
  const labelUpdate = resourceHooks.label.useUpdate();
  const labelDelete = resourceHooks.label.useDelete();
  const groupCreate = resourceHooks.labelGroup.useCreate();
  const groupUpdate = resourceHooks.labelGroup.useUpdate();
  const groupDelete = resourceHooks.labelGroup.useDelete();

  const loading = labelsLoading || groupsLoading;

  const handleCreateLabel = async (labelData: { name: string; description: string; color: string; groupId?: string }) => {
    try {
      // Handle the case where groupId is an empty string (ungrouped)
      const finalGroupId = labelData.groupId === '' ? undefined : labelData.groupId;
      const groupLabels = labels.filter((l: Label) => l.groupId === finalGroupId);
      
      await labelCreate.create({
        ...labelData,
        groupId: finalGroupId,
        position: groupLabels.length
      });
      
      toast.success('Label created successfully');
      // Immediately hide the creation form after successful save - no more empty rows
      setCreatingInGroup(null);
    } catch (error: any) {
      toast.error(`Failed to create label: ${error.message}`);
      throw error; // Re-throw to let the CreateLabelRow component handle the error state
    }
  };

  const handleUpdateLabel = async (label: Label, updates: Partial<Label>) => {
    try {
      await labelUpdate.update(label.id, updates);
      toast.success('Label updated successfully');
      setEditingLabelId(null);
    } catch (error: any) {
      toast.error(`Failed to update label: ${error.message}`);
    }
  };

  const handleDeleteLabel = async (label: Label) => {
    try {
      await labelDelete.delete(label.id);
      toast.success('Label deleted successfully');
    } catch (error: any) {
      toast.error(`Failed to delete label: ${error.message}`);
    }
  };

  const handleCreateGroup = async (groupData: { name: string; description: string; color: string }) => {
    try {
      await groupCreate.create({
        ...groupData,
        position: groups.length
      });
      
      toast.success('Label group created successfully');
      setCreatingGroup(false);
    } catch (error: any) {
      toast.error(`Failed to create label group: ${error.message}`);
    }
  };

  const handleUpdateGroup = async (group: LabelGroup, updates: Partial<LabelGroup>) => {
    try {
      await groupUpdate.update(group.id, updates);
      toast.success('Label group updated successfully');
      setEditingGroupId(null);
    } catch (error: any) {
      toast.error(`Failed to update label group: ${error.message}`);
    }
  };

  const handleDeleteGroup = async (group: LabelGroup) => {
    try {
      await groupDelete.delete(group.id);
      toast.success('Label group deleted successfully');
    } catch (error: any) {
      toast.error(`Failed to delete label group: ${error.message}`);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    // Find the active and over items in the flattened structure
    const activeItem = flattenedItems.find(item => item.id === active.id);
    const overItem = flattenedItems.find(item => item.id === over.id);
    
    if (!activeItem || !overItem) return;

    // Handle both label and group dragging
    if (activeItem.type === 'group') {
      // Group reordering logic
      if (overItem.type === 'group') {
        const activeGroup = activeItem.data as LabelGroup;
        const overGroup = overItem.data as LabelGroup;
        
        const oldIndex = groups.findIndex(g => g.id === activeGroup.id);
        const newIndex = groups.findIndex(g => g.id === overGroup.id);
        
        if (oldIndex !== newIndex) {
          const reorderedGroups = arrayMove(groups, oldIndex, newIndex);
          
          await Promise.all(
            reorderedGroups.map((group: LabelGroup, index: number) => 
              groupUpdate.update(group.id, { position: index })
            )
          );
          toast.success('Groups reordered');
        }
      }
      return;
    }

    const activeLabel = activeItem.data as Label;
    
    try {
      if (overItem.type === 'group') {
        // Dropping label onto a group - move label to that group
        const targetGroupLabels = labels.filter((l: Label) => l.groupId === overItem.id);
        await labelUpdate.update(activeLabel.id, { 
          groupId: overItem.id,
          position: targetGroupLabels.length
        });
        toast.success('Label moved to group');
      } else {
        // Dropping label onto another label
        const overLabel = overItem.data as Label;
        
        if (activeLabel.groupId === overLabel.groupId) {
          // Moving within the same group
          const groupLabels = labels.filter((l: Label) => l.groupId === activeLabel.groupId);
          const oldIndex = groupLabels.findIndex((l: Label) => l.id === active.id);
          const newIndex = groupLabels.findIndex((l: Label) => l.id === over.id);
          
          const reorderedLabels = arrayMove(groupLabels, oldIndex, newIndex);
          
          await Promise.all(
            reorderedLabels.map((label: Label, index: number) => 
              labelUpdate.update(label.id, { position: index })
            )
          );
          toast.success('Labels reordered');
        } else {
          // Moving to a different group
          const targetGroupLabels = labels.filter((l: Label) => l.groupId === overLabel.groupId);
          await labelUpdate.update(activeLabel.id, { 
            groupId: overLabel.groupId,
            position: targetGroupLabels.length
          });
          toast.success('Label moved to new group');
        }
      }
    } catch (error: any) {
      toast.error('Failed to move label');
    }
  };

  const toggleGroupCollapse = (groupId: string) => {
    setCollapsedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  };

  // Filter labels and groups based on search
  const filteredLabels = labels.filter((label: Label) => 
    label.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    label.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredGroups = groups.filter((group: LabelGroup) =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Create flattened structure for tree view
  const createFlattenedItems = (): FlattenedItem[] => {
    const items: FlattenedItem[] = [];
    const sortedGroups = [...filteredGroups].sort((a, b) => (a.position || 0) - (b.position || 0));
    
    // Add ungrouped labels first (level 0)
    const ungroupedLabels = filteredLabels
      .filter((label: Label) => !label.groupId)
      .sort((a: Label, b: Label) => (a.position || 0) - (b.position || 0));
    
    ungroupedLabels.forEach(label => {
      items.push({
        id: label.id,
        type: 'label',
        level: 0,
        data: label
      });
    });
    
    // Add groups and their labels
    sortedGroups.forEach(group => {
      // Add group item (level 0)
      items.push({
        id: group.id,
        type: 'group',
        level: 0,
        data: group
      });
      
      // Add group's labels (level 1) - only if group is not collapsed
      if (!collapsedGroups.has(group.id)) {
        const groupLabels = filteredLabels
          .filter((label: Label) => label.groupId === group.id)
          .sort((a: Label, b: Label) => (a.position || 0) - (b.position || 0));
        
        groupLabels.forEach(label => {
          items.push({
            id: label.id,
            type: 'label',
            level: 1,
            data: label,
            groupId: group.id
          });
        });
      }
    });
    
    return items;
  };

  const flattenedItems = createFlattenedItems();

  return (
    <div className="min-h-screen bg-muted/5">
      <div className="max-w-3xl mx-auto space-y-4 p-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Labels
            </Button>
            <div className="h-4 w-px bg-border" />
            <div>
              <h1 className="text-lg font-semibold">Label Editor</h1>
              <p className="text-sm text-muted-foreground">
                Organize and categorize your issues with labels and groups
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setCreatingInGroup('')}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Label
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setCreatingGroup(true)}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Group
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="max-w-md">
          <Input
            placeholder="Search labels..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>

        {/* Create Group Form */}
        {creatingGroup && (
          <div className="rounded-lg border bg-muted/10 p-4">
            <CreateGroupForm
              onSave={handleCreateGroup}
              onCancel={() => setCreatingGroup(false)}
            />
          </div>
        )}

        {/* Flattened Tree Structure */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="rounded-md border bg-muted/10">
            <SortableContext items={flattenedItems.map(item => item.id)} strategy={verticalListSortingStrategy}>
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-2 font-medium text-sm w-8"></th>
                    <th className="text-left p-2 font-medium text-sm">Label</th>
                    <th className="text-left p-2 font-medium text-sm">Description</th>
                    <th className="text-right p-2 font-medium text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Creation row at top for ungrouped labels */}
                  {creatingInGroup === '' && (
                    <CreateLabelRow
                      groupId={undefined}
                      onSave={handleCreateLabel}
                      onCancel={() => setCreatingInGroup(null)}
                    />
                  )}
                  
                  {flattenedItems.map((item, index) => (
                    <React.Fragment key={item.id}>
                      <TreeItemRow
                        item={item}
                        isEditing={item.type === 'label' ? editingLabelId === item.id : editingGroupId === item.id}
                        onStartEdit={() => {
                          if (item.type === 'label') {
                            setEditingLabelId(item.id);
                          } else {
                            setEditingGroupId(item.id);
                          }
                        }}
                        onCancelEdit={() => {
                          if (item.type === 'label') {
                            setEditingLabelId(null);
                          } else {
                            setEditingGroupId(null);
                          }
                        }}
                        onUpdate={item.type === 'label' ? handleUpdateLabel : handleUpdateGroup}
                        onDelete={item.type === 'label' ? handleDeleteLabel : handleDeleteGroup}
                        onToggleCollapse={toggleGroupCollapse}
                        isCollapsed={item.type === 'group' ? collapsedGroups.has(item.id) : false}
                        onAddToGroup={() => setCreatingInGroup(item.id)}
                      />
                      
                      {/* Creation row right after group */}
                      {item.type === 'group' && creatingInGroup === item.id && (
                        <CreateLabelRow
                          groupId={item.id}
                          onSave={handleCreateLabel}
                          onCancel={() => setCreatingInGroup(null)}
                        />
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </SortableContext>
          </div>
        </DndContext>

        {/* Empty State */}
        {flattenedItems.length === 0 && !loading && (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">No labels found. Create your first label to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function TreeItemRow({ 
  item, 
  isEditing,
  onStartEdit,
  onCancelEdit,
  onUpdate, 
  onDelete,
  onToggleCollapse,
  isCollapsed,
  onAddToGroup
}: { 
  item: FlattenedItem;
  isEditing: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onUpdate: (item: any, updates: any) => void;
  onDelete: (item: any) => void;
  onToggleCollapse: (id: string) => void;
  isCollapsed: boolean;
  onAddToGroup: () => void;
}) {
  const [showAddButton, setShowAddButton] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editColor, setEditColor] = useState('#3B82F6');

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ 
    id: item.id,
    data: { type: item.type }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Initialize edit state
  useEffect(() => {
    if (isEditing) {
      setEditName(item.data.name || '');
      setEditDescription(item.data.description || '');
      setEditColor(item.data.color || '#3B82F6');
    }
  }, [isEditing, item.data]);

  const handleSave = () => {
    const updates = {
      name: editName.trim(),
      description: editDescription.trim(),
      color: editColor
    };
    
    onUpdate(item.data, updates);
  };

  const handleCancel = () => {
    setEditName(item.data.name || '');
    setEditDescription(item.data.description || '');
    setEditColor(item.data.color || '#3B82F6');
    onCancelEdit();
  };

  const indentLevel = item.level * 20; // 20px per level

  return (
    <tr 
      ref={setNodeRef} 
      style={style} 
      className="border-b hover:bg-muted/25 group"
      onMouseEnter={() => item.type === 'group' && setShowAddButton(true)}
      onMouseLeave={() => setShowAddButton(false)}
    >
      <td className="p-2" style={{ paddingLeft: `${8 + indentLevel}px` }}>
        <div 
          {...attributes} 
          {...listeners} 
          className="cursor-grab hover:cursor-grabbing flex items-center"
        >
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </div>
      </td>
      <td className="p-2 relative">
        <div className="flex items-center gap-3" style={{ paddingLeft: `${indentLevel}px` }}>
          {/* Connection line for child items */}
          {item.level > 0 && (
            <div 
              className="absolute border-l border-dashed border-muted-foreground/30"
              style={{ 
                left: `${8 + (item.level - 1) * 20 + 16}px`,
                top: 0,
                bottom: 0,
                width: '1px'
              }}
            />
          )}
          {item.level > 0 && (
            <div 
              className="absolute border-t border-dashed border-muted-foreground/30"
              style={{ 
                left: `${8 + (item.level - 1) * 20 + 16}px`,
                top: '50%',
                width: '12px',
                height: '1px'
              }}
            />
          )}
          
          {item.type === 'group' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleCollapse(item.id)}
              className="p-1"
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          )}
          
          {isEditing ? (
            <ColorPicker
              selectedColor={editColor}
              onColorSelect={setEditColor}
              className="w-6 h-6"
            />
          ) : (
            item.type === 'group' ? (
              <div className="flex items-center justify-center w-6 h-6">
                <DiamondShape color={item.data.color || '#6B7280'} size={12} />
              </div>
            ) : (
              <div 
                className="w-6 h-6 rounded-full border"
                style={{ backgroundColor: item.data.color || '#6B7280' }}
              />
            )
          )}
          
          {isEditing ? (
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="text-sm"
              placeholder={item.type === 'group' ? 'Group name' : 'Label name'}
            />
          ) : (
            item.type === 'group' ? (
              <div className="flex items-center gap-2">
                <span className="font-medium">{item.data.name}</span>
                {showAddButton && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onAddToGroup}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ) : (
              <Badge 
                variant="outline" 
                className="gap-2"
                style={{ 
                  backgroundColor: `${item.data.color || '#6B7280'}20`, 
                  borderColor: item.data.color || '#6B7280',
                  color: item.data.color || '#6B7280'
                }}
              >
                {item.data.name}
              </Badge>
            )
          )}
        </div>
      </td>
      <td className="p-2">
        {isEditing ? (
          <Input
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            placeholder="Description..."
            className="text-sm"
          />
        ) : (
          <span className="text-sm text-muted-foreground">
            {item.data.description || '-'}
          </span>
        )}
      </td>
      <td className="p-2 text-right">
        <div className="flex items-center gap-2 justify-end">
          {isEditing ? (
            <>
              <Button size="sm" onClick={handleSave}>
                <Check className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancel}>
                <X className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={onStartEdit}>
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onDelete(item.data)} className="text-destructive">
                <X className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}

function SortableLabelRow({ 
  label, 
  isEditing,
  onStartEdit,
  onCancelEdit,
  onUpdate, 
  onDelete 
}: { 
  label: Label; 
  isEditing: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onUpdate: (label: Label, updates: Partial<Label>) => void;
  onDelete: (label: Label) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: label.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <LabelRow
      ref={setNodeRef}
      style={style}
      label={label}
      isEditing={isEditing}
      onStartEdit={onStartEdit}
      onCancelEdit={onCancelEdit}
      onUpdate={onUpdate}
      onDelete={onDelete}
      dragHandleProps={{ ...attributes, ...listeners }}
    />
  );
}

function LabelRow({ 
  label, 
  isEditing,
  onStartEdit,
  onCancelEdit,
  onUpdate, 
  onDelete,
  dragHandleProps,
  style,
  ref
}: { 
  label: Label; 
  isEditing: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onUpdate: (label: Label, updates: Partial<Label>) => void;
  onDelete: (label: Label) => void;
  dragHandleProps?: any;
  style?: any;
  ref?: any;
}) {
  const [editName, setEditName] = useState(label.name);
  const [editDescription, setEditDescription] = useState(label.description || '');
  const [editColor, setEditColor] = useState(label.color || '#6B7280');

  const handleSave = () => {
    const updates: Partial<Label> = {
      name: editName.trim(),
      description: editDescription.trim(),
      color: editColor
    };
    
    onUpdate(label, updates);
  };

  const handleCancel = () => {
    setEditName(label.name);
    setEditDescription(label.description || '');
    setEditColor(label.color || '#6B7280');
    onCancelEdit();
  };

  return (
    <tr ref={ref} style={style} className="border-b hover:bg-muted/25">
      <td className="p-2">
        <div {...dragHandleProps} className="cursor-grab hover:cursor-grabbing">
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </div>
      </td>
      <td className="p-2">
        <div className="flex items-center gap-3">
          {isEditing ? (
            <ColorPicker
              selectedColor={editColor}
              onColorSelect={setEditColor}
              className="w-6 h-6"
            />
          ) : (
            <div 
              className="w-6 h-6 rounded-full border"
              style={{ backgroundColor: label.color || '#6B7280' }}
            />
          )}
          
          {isEditing ? (
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="text-sm"
              placeholder="Label name"
            />
          ) : (
            <Badge 
              variant="outline" 
              className="gap-2"
              style={{ 
                backgroundColor: `${label.color || '#6B7280'}20`, 
                borderColor: label.color || '#6B7280',
                color: label.color || '#6B7280'
              }}
            >
              {label.name}
            </Badge>
          )}
        </div>
      </td>
      <td className="p-2">
        {isEditing ? (
          <Input
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            placeholder="Description..."
            className="text-sm"
          />
        ) : (
          <span className="text-sm text-muted-foreground">
            {label.description || '-'}
          </span>
        )}
      </td>
      <td className="p-2 text-right">
        <div className="flex items-center gap-2 justify-end">
          {isEditing ? (
            <>
              <Button size="sm" onClick={handleSave}>
                <Check className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancel}>
                <X className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={onStartEdit}>
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onDelete(label)} className="text-destructive">
                <X className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}

function CreateLabelRow({
  groupId,
  onSave,
  onCancel
}: {
  groupId?: string;
  onSave: (labelData: { name: string; description: string; color: string; groupId?: string }) => Promise<void>;
  onCancel: () => void;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#3B82F6');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim() || isSaving) return;
    
    setIsSaving(true);
    try {
      await onSave({
        name: name.trim(),
        description: description.trim(),
        color,
        groupId
      });
      // Clear form state after successful save
      setName('');
      setDescription('');
      setColor('#3B82F6');
    } catch (error) {
      console.error('Error saving label:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Clear form state when canceling
    setName('');
    setDescription('');
    setColor('#3B82F6');
    onCancel();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isSaving) {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <tr className="border-b bg-muted/10">
      <td className="p-2"></td>
      <td className="p-2">
        <div className="flex items-center gap-3">
          <ColorPicker
            selectedColor={color}
            onColorSelect={setColor}
            className="w-6 h-6"
          />
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Label name"
            className="text-sm"
            autoFocus
          />
        </div>
      </td>
      <td className="p-2">
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Description..."
          className="text-sm"
        />
      </td>
      <td className="p-2 text-right">
        <div className="flex items-center gap-2 justify-end">
          <Button size="sm" onClick={handleSave} disabled={!name.trim() || isSaving}>
            <Check className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={handleCancel} disabled={isSaving}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
}

function CreateGroupForm({
  onSave,
  onCancel
}: {
  onSave: (groupData: { name: string; description: string; color: string }) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#6B7280');

  const handleSave = () => {
    if (!name.trim()) return;
    
    onSave({
      name: name.trim(),
      description: description.trim(),
      color
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="font-medium">Create Label Group</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Name</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Group name"
            autoFocus
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Color</label>
          <ColorPicker
            selectedColor={color}
            onColorSelect={setColor}
          />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Description</label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Group description..."
          rows={2}
        />
      </div>
      <div className="flex gap-2">
        <Button onClick={handleSave} disabled={!name.trim()}>
          Create Group
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

function EditGroupForm({
  group,
  onSave,
  onCancel
}: {
  group: LabelGroup;
  onSave: (group: LabelGroup, updates: Partial<LabelGroup>) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(group.name);
  const [description, setDescription] = useState(group.description || '');
  const [color, setColor] = useState(group.color || '#6B7280');

  const handleSave = () => {
    const updates: Partial<LabelGroup> = {
      name: name.trim(),
      description: description.trim(),
      color
    };
    
    onSave(group, updates);
  };

  return (
    <div className="flex items-center gap-2">
      <ColorPicker
        selectedColor={color}
        onColorSelect={setColor}
        className="w-6 h-6"
      />
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-48"
        placeholder="Group name"
      />
      <Input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-64"
        placeholder="Description..."
      />
      <Button size="sm" onClick={handleSave}>
        <Check className="w-4 h-4" />
      </Button>
      <Button size="sm" variant="outline" onClick={onCancel}>
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
} 