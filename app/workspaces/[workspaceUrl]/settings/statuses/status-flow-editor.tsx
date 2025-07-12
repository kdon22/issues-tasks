"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ColorPicker } from '@/components/ui/color-picker';
import { resourceHooks, useActionClient, useActionMutation } from '@/lib/hooks/use-action-api';
import { ArrowLeft, Check, X, Edit2, Plus, Circle, GripVertical } from 'lucide-react';
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

interface State {
  id: string;
  name: string;
  description?: string;
  color: string;
  type: 'BACKLOG' | 'UNSTARTED' | 'STARTED' | 'COMPLETED' | 'CANCELED';
  position: number;
}

// Status type categories for Linear-style organization
const STATUS_CATEGORIES = [
  { 
    key: 'BACKLOG', 
    label: 'Backlog', 
    description: 'Work that has not yet been started',
    color: '#F59E0B',
    icon: Circle
  },
  { 
    key: 'UNSTARTED', 
    label: 'Planned', 
    description: 'Work that is planned and ready to start',
    color: '#64748B',
    icon: Circle
  },
  { 
    key: 'STARTED', 
    label: 'In Progress', 
    description: 'Work that is currently being worked on',
    color: '#3B82F6',
    icon: Circle
  },
  { 
    key: 'COMPLETED', 
    label: 'Completed', 
    description: 'Work that has been finished',
    color: '#10B981',
    icon: Circle
  },
  { 
    key: 'CANCELED', 
    label: 'Canceled', 
    description: 'Work that has been canceled',
    color: '#EF4444',
    icon: Circle
  },
];

// Progress pie component showing completion ratio as filled pie slices
function ProgressPie({ 
  color, 
  progress, 
  size = 24 
}: { 
  color: string; 
  progress: number; 
  size?: number; 
}) {
  const radius = (size - 2) / 2;
  const center = size / 2;
  
  // For 100% progress, we'll use 99.9% to show a tiny gap and maintain the pie appearance
  const effectiveProgress = progress >= 1 ? 0.999 : progress;
  
  // Calculate the end angle for the progress arc (starting from top, going clockwise)
  const endAngle = (effectiveProgress * 360) - 90; // -90 to start from top
  const startAngle = -90;
  
  // Convert angles to radians
  const startAngleRad = (startAngle * Math.PI) / 180;
  const endAngleRad = (endAngle * Math.PI) / 180;
  
  // Calculate arc path
  const largeArcFlag = effectiveProgress > 0.5 ? 1 : 0;
  const x1 = center + radius * Math.cos(startAngleRad);
  const y1 = center + radius * Math.sin(startAngleRad);
  const x2 = center + radius * Math.cos(endAngleRad);
  const y2 = center + radius * Math.sin(endAngleRad);
  
  const pathData = effectiveProgress === 0 
    ? '' 
    : `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="#f3f4f6"
          stroke="#e5e7eb"
          strokeWidth="1"
        />
        
        {/* Progress pie slice */}
        {effectiveProgress > 0 && (
          <path
            d={pathData}
            fill={color}
            opacity="0.8"
          />
        )}
        
        {/* Border circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="1"
        />
      </svg>
    </div>
  );
}

interface StatusFlowEditorProps {
  flow: StatusFlow;
  workspaceUrl: string;
  onBack: () => void;
  onUpdate: () => void;
}

export function StatusFlowEditor({ flow, workspaceUrl, onBack, onUpdate }: StatusFlowEditorProps) {
  const [flowName, setFlowName] = useState(flow.name);
  const [flowDescription, setFlowDescription] = useState(flow.description || '');
  const [editingFlowInfo, setEditingFlowInfo] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingStatusId, setEditingStatusId] = useState<string | null>(null);
  const [creatingInCategory, setCreatingInCategory] = useState<string | null>(null);
  const [lastColorPerCategory, setLastColorPerCategory] = useState<Record<string, string>>({});

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Detect if this is a new flow (id is 'new' placeholder)
  const isNewFlow = flow.id === 'new';

  // Use standardized resource hooks with optimistic updates enabled
  const { data: statusFlowData, isLoading: loading, error } = resourceHooks.statusFlow.useGet(flow.id);
  const statusFlowCreate = resourceHooks.statusFlow.useCreate();
  const statusFlowUpdate = resourceHooks.statusFlow.useUpdate();
  const stateCreate = resourceHooks.state.useCreate();
  const stateUpdate = resourceHooks.state.useUpdate();
  const stateDelete = resourceHooks.state.useDelete();

  const states = (statusFlowData?.states || []).map((state: any) => ({
    ...state,
    position: state.position || 0
  })) as State[];

  // Helper functions using standardized hooks
  const handleUpdateFlowInfo = async () => {
    try {
      if (isNewFlow) {
        // For new flows, create the flow and keep editor open for adding statuses
        await statusFlowCreate.create({ name: flowName, description: flowDescription });
        toast.success('Status flow created successfully');
        setEditingFlowInfo(false);
        // Don't call onUpdate() - keep editor open so user can add statuses
      } else {
        // For existing flows, just update and keep editor open
        await statusFlowUpdate.update(flow.id, { name: flowName, description: flowDescription });
        toast.success('Status flow updated successfully');
        setEditingFlowInfo(false);
      }
    } catch (error: any) {
      toast.error(`Failed to ${isNewFlow ? 'create' : 'update'} status flow: ${error.message}`);
    }
  };



  const handleCreateStatus = async (statusData: { name: string; description: string; color: string; type: State['type'] }) => {
    try {
      await stateCreate.create({
        ...statusData,
        position: states.filter((s: State) => s.type === statusData.type).length,
        statusFlowId: flow.id
      });
      
      // Update the last color used for this category
      setLastColorPerCategory(prev => ({
        ...prev,
        [statusData.type]: statusData.color
      }));
      
      toast.success('Status created successfully');
      setCreatingInCategory(null);
    } catch (error: any) {
      toast.error(`Failed to create status: ${error.message}`);
    }
  };

  const handleUpdateStatus = async (status: State, updates: Partial<State>) => {
    try {
      await stateUpdate.update(status.id, updates);
      
      // Update the last color used for this category if color was changed
      if (updates.color && typeof updates.color === 'string') {
        setLastColorPerCategory(prev => ({
          ...prev,
          [status.type]: updates.color as string
        }));
      }
      
      toast.success('Status updated successfully');
      setEditingStatusId(null);
      // Don't call refetch() - let optimistic updates handle it
    } catch (error: any) {
      toast.error(`Failed to update status: ${error.message}`);
    }
  };

  const handleDeleteStatus = async (status: State) => {
    try {
      await stateDelete.delete(status.id);
      toast.success('Status deleted successfully');
      // Don't call refetch() - let optimistic updates handle it
    } catch (error: any) {
      toast.error(`Failed to delete status: ${error.message}`);
    }
  };

  const handleStartCreating = (type: State['type']) => {
    setCreatingInCategory(type);
    setEditingStatusId(null);
  };

  const handleCancelCreating = () => {
    setCreatingInCategory(null);
  };

  const handleDragEnd = async (event: DragEndEvent, categoryType: string) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const categoryStatuses = states.filter((s: State) => s.type === categoryType);
    const oldIndex = categoryStatuses.findIndex((s: State) => s.id === active.id);
    const newIndex = categoryStatuses.findIndex((s: State) => s.id === over.id);
    
    if (oldIndex === -1 || newIndex === -1) return;

    const reorderedStatuses = arrayMove(categoryStatuses, oldIndex, newIndex);
    
    // Update positions optimistically
    try {
      await Promise.all(
        reorderedStatuses.map((status: State, index: number) => 
          stateUpdate.update(status.id, { position: index })
        )
      );
      // Optimistic updates will handle the UI changes
    } catch (error: any) {
      toast.error('Failed to reorder statuses');
    }
  };

  // Filter statuses based on search
  const filteredStatuses = states.filter((status: State) => 
    status.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    status.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group statuses by category
  const groupedStatuses = STATUS_CATEGORIES.map(category => ({
    category,
    statuses: filteredStatuses
      .filter((status: State) => status.type === category.key)
      .sort((a: State, b: State) => a.position - b.position) // Sort by position within category
  }));

  // Helper function to get the default color for a category
  const getDefaultColorForCategory = (categoryKey: string, categoryColor: string) => {
    return lastColorPerCategory[categoryKey] || categoryColor;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* Flow Info Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Status Flows
          </Button>
          <div className="h-4 w-px bg-border" />
          {editingFlowInfo ? (
            <div className="flex items-center gap-2">
              <Input
                value={flowName}
                onChange={(e) => setFlowName(e.target.value)}
                placeholder="Status flow name"
                className="w-48"
              />
              <Button onClick={handleUpdateFlowInfo} size="sm" disabled={statusFlowUpdate.isPending}>
                <Check className="w-4 h-4" />
              </Button>
              <Button onClick={() => setEditingFlowInfo(false)} variant="outline" size="sm">
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold">{flowName}</h1>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingFlowInfo(true)}
              >
                <Edit2 className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Flow Description */}
      {editingFlowInfo ? (
        <div className="space-y-2">
          <label className="text-sm font-medium">Description</label>
          <Textarea
            value={flowDescription}
            onChange={(e) => setFlowDescription(e.target.value)}
            placeholder="Describe this status flow..."
            rows={2}
            className="max-w-md"
          />
        </div>
      ) : (
        flowDescription && (
          <p className="text-sm text-muted-foreground">{flowDescription}</p>
        )
      )}

      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold">Workflow Statuses</h2>
        <p className="text-sm text-muted-foreground">
          Configure the statuses in this workflow
        </p>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <Input
          placeholder="Search status..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full"
        />
      </div>

      {/* Status Categories */}
      <div className="space-y-6">
        {groupedStatuses.map(({ category, statuses }) => (
          <div key={category.key} className="space-y-3">
            {/* Category Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div 
                  className="w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: category.color }}
                >
                  <category.icon className="w-3 h-3 text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-base">{category.label}</h3>
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleStartCreating(category.key as State['type'])}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* Statuses Table */}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={(event) => handleDragEnd(event, category.key)}
            >
              <div className="rounded-md border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-2 font-medium text-sm w-8"></th>
                      <th className="text-left p-2 font-medium text-sm">Status</th>
                      <th className="text-left p-2 font-medium text-sm">Description</th>
                      <th className="text-right p-2 font-medium text-sm">Actions</th>
                    </tr>
                  </thead>
                  <SortableContext items={statuses.map((s: State) => s.id)} strategy={verticalListSortingStrategy}>
                    <tbody>
                      {statuses.map((status: State, index: number) => (
                        <SortableStatusRow
                          key={status.id}
                          status={status}
                          progress={statuses.length > 0 ? (index + 1) / statuses.length : 0}
                          isEditing={editingStatusId === status.id}
                          onStartEdit={() => setEditingStatusId(status.id)}
                          onCancelEdit={() => setEditingStatusId(null)}
                          onUpdate={handleUpdateStatus}
                          onDelete={handleDeleteStatus}
                        />
                      ))}
                      
                      {/* Inline Creation Row */}
                      {creatingInCategory === category.key && (
                        <CreateStatusRow
                          categoryType={category.key as State['type']}
                          defaultColor={getDefaultColorForCategory(category.key, category.color)}
                          onSave={handleCreateStatus}
                          onCancel={handleCancelCreating}
                        />
                      )}
                    </tbody>
                  </SortableContext>
                </table>
              </div>
            </DndContext>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredStatuses.length === 0 && !loading && (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">No status found. Create your first status to get started.</p>
        </div>
      )}
    </div>
  );
}

function SortableStatusRow({ 
  status, 
  progress,
  isEditing,
  onStartEdit,
  onCancelEdit,
  onUpdate, 
  onDelete 
}: { 
  status: State; 
  progress: number;
  isEditing: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onUpdate: (status: State, updates: Partial<State>) => void;
  onDelete: (status: State) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: status.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <StatusRow
      ref={setNodeRef}
      style={style}
      status={status}
      progress={progress}
      isEditing={isEditing}
      onStartEdit={onStartEdit}
      onCancelEdit={onCancelEdit}
      onUpdate={onUpdate}
      onDelete={onDelete}
      dragHandleProps={{ ...attributes, ...listeners }}
    />
  );
}

function StatusRow({ 
  status, 
  progress,
  isEditing,
  onStartEdit,
  onCancelEdit,
  onUpdate, 
  onDelete,
  dragHandleProps,
  style,
  ref
}: { 
  status: State; 
  progress: number;
  isEditing: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onUpdate: (status: State, updates: Partial<State>) => void;
  onDelete: (status: State) => void;
  dragHandleProps?: any;
  style?: any;
  ref?: any;
}) {
  const [editName, setEditName] = useState(status.name);
  const [editDescription, setEditDescription] = useState(status.description || '');
  const [editColor, setEditColor] = useState(status.color);

  const handleSave = () => {
    const updates: Partial<State> = {
      name: editName.trim(),
      description: editDescription.trim(),
      color: editColor
    };
    
    onUpdate(status, updates);
  };

  const handleCancel = () => {
    setEditName(status.name);
    setEditDescription(status.description || '');
    setEditColor(status.color);
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
            <ProgressPie
              color={status.color}
              progress={progress}
              size={24}
            />
          )}
          
          {isEditing ? (
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="text-sm"
              placeholder="Status name"
            />
          ) : (
            <Badge 
              variant="outline" 
              className="gap-2"
              style={{ 
                backgroundColor: `${status.color}20`, 
                borderColor: status.color,
                color: status.color
              }}
            >
              <div 
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: status.color }}
              />
              {status.name}
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
            {status.description || '-'}
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
              <Button variant="ghost" size="sm" onClick={() => onDelete(status)} className="text-destructive">
                <X className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}

function CreateStatusRow({
  categoryType,
  defaultColor,
  onSave,
  onCancel
}: {
  categoryType: State['type'];
  defaultColor: string;
  onSave: (statusData: { name: string; description: string; color: string; type: State['type'] }) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(defaultColor);

  const handleSave = () => {
    if (!name.trim()) return;
    
    onSave({
      name: name.trim(),
      description: description.trim(),
      color,
      type: categoryType
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      onCancel();
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
            placeholder="Status name"
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
          <Button size="sm" onClick={handleSave} disabled={!name.trim()}>
            <Check className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
} 