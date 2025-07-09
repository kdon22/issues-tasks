"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit2, Check, X, ChevronRight, ChevronDown, User, Clock, CheckCircle, Paperclip, Save } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { StateBadge } from '@/components/ui/state-badge';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { cn } from '@/lib/utils';
import { CreateSubtaskDialog } from './create-subtask-dialog';
import { IssueTypePicker, IssueTypeIcon } from './issue-type-picker';
import { StatusSelector } from './status-selector';
import { useCreateIssue, useUpdateIssue, useActionQuery } from '@/lib/hooks';
import { toast } from 'sonner';

interface User {
  id: string;
  name: string | null;
  email: string;
}

interface State {
  id: string;
  name: string;
  color: string;
  type: 'UNSTARTED' | 'STARTED' | 'COMPLETED' | 'CANCELED';
  position: number;
}

interface IssueType {
  id: string;
  name: string;
  icon?: string | null;
  description?: string | null;
  fieldSetId?: string | null;
}

interface Project {
  id: string;
  name: string;
  identifier: string;
  color?: string | null;
}

interface SubTask {
  id: string;
  title: string;
  description?: string | null;
  identifier: string;
  assignee?: User | null;
  state: State;
  issueType?: IssueType | null;
  createdAt: string;
}

interface Issue {
  id: string;
  title: string;
  identifier: string;
  teamId: string;
  projectId?: string | null;
  issueType?: IssueType | null;
}

interface FieldConfiguration {
  fieldKey: string;
  isRequired: boolean;
  showOnSubtask: boolean;
  showOnNewIssue: boolean;
  displayOrder: number;
}

interface IssueSubTasksProps {
  subTasks: SubTask[];
  workspaceUrl: string;
  parentIssue: Issue;
  issueTypes: IssueType[];
  states: State[];
  members: User[];
  projects: Project[];
  fieldConfigurations?: FieldConfiguration[];
  onSubtaskCreated?: (subtask: SubTask) => void;
  onSubtaskUpdated?: (subtask: SubTask) => void;
  onCreateSubtaskClick?: () => void;
  onHideInterface?: () => void;
  autoStartCreation?: boolean;
}

// Sub-component for individual subtask rows
function SubTaskRow({ 
  subTask, 
  workspaceUrl,
  onUpdate 
}: { 
  subTask: SubTask; 
  workspaceUrl: string;
  onUpdate?: (id: string, title: string, description?: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(subTask.title);
  const [editedDescription, setEditedDescription] = useState(subTask.description || '');

  const handleSave = () => {
    setIsEditing(false);
    if (onUpdate && (editedTitle !== subTask.title || editedDescription !== subTask.description)) {
      onUpdate(subTask.id, editedTitle, editedDescription);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedTitle(subTask.title);
    setEditedDescription(subTask.description || '');
  };

  if (isEditing) {
    return (
      <div className="p-4 bg-gray-50 border-l-4 border-blue-500">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-mono text-gray-500">{subTask.identifier}</span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                className="h-8 px-3"
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleSave}
                className="h-8 px-3"
              >
                <Check className="h-4 w-4 mr-1" />
                Save
              </Button>
            </div>
          </div>
          
          <Input
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            placeholder="Subtask title..."
            className="font-medium"
          />
          
          <Textarea
            value={editedDescription}
            onChange={(e) => setEditedDescription(e.target.value)}
            placeholder="Add a description..."
            className="min-h-[120px]"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group border border-transparent hover:border-gray-200 dark:hover:border-gray-700 cursor-pointer">
      <div className="flex items-start gap-3">
        {/* Issue Type Icon */}
        {subTask.issueType && (
          <div className="flex-shrink-0 mt-0.5">
            <IssueTypeIcon issueType={subTask.issueType} size="xs" />
          </div>
        )}

        {/* Status */}
        <div className="flex-shrink-0 mt-0.5">
          <StateBadge state={subTask.state.type as any} />
        </div>

        {/* Issue identifier */}
        <div className="flex-shrink-0 w-14">
          <Link 
            href={`/workspaces/${workspaceUrl}/issues/${subTask.id}`}
            className="text-xs font-mono text-gray-500 hover:text-blue-600 transition-colors"
          >
            {subTask.identifier}
          </Link>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div 
              className="flex-1 min-w-0 cursor-pointer hover:bg-gray-100 rounded p-1 -m-1 transition-colors"
              onClick={() => setIsEditing(true)}
              title="Click to edit subtask"
            >
              <div className="text-sm font-medium text-gray-900 leading-5 pointer-events-none">
                {subTask.title}
              </div>
              
              {subTask.description && (
                <div className="text-sm text-gray-600 prose prose-sm max-w-none mt-1 pointer-events-none">
                  <Textarea
                    value={subTask.description}
                    className="border-none bg-transparent p-0"
                  />
                </div>
              )}
            </div>
            
            <div className="ml-2">
              <Link 
                href={`/workspaces/${workspaceUrl}/issues/${subTask.id}`}
                className="text-xs text-gray-500 hover:text-blue-600 transition-colors"
                title="Open subtask"
              >
                Open →
              </Link>
            </div>
          </div>
        </div>

        {/* Assignee */}
        <div className="flex-shrink-0">
          {subTask.assignee ? (
            <div className="flex items-center gap-2">
              <Avatar className="h-5 w-5">
                <AvatarFallback className="text-xs">
                                          {(subTask.assignee.name || subTask.assignee.email).charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-gray-600 hidden lg:block max-w-20 truncate">
                {subTask.assignee.name || subTask.assignee.email}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-gray-400">
              <User className="h-4 w-4" />
              <span className="text-xs hidden lg:block">Unassigned</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Shared subtask creation form component
function SubtaskCreationForm({ 
  newSubtaskTitle, 
  setNewSubtaskTitle, 
  newSubtaskDescription, 
  setNewSubtaskDescription,
  selectedIssueType,
  setSelectedIssueType,
  issueTypes,
  parentIssue,
  renderAllDynamicFields,
  handleCancel,
  handleSubmit
}: {
  newSubtaskTitle: string;
  setNewSubtaskTitle: (title: string) => void;
  newSubtaskDescription: string;
  setNewSubtaskDescription: (desc: string) => void;
  selectedIssueType: IssueType | null;
  setSelectedIssueType: (type: IssueType | null) => void;
  issueTypes: IssueType[];
  parentIssue: Issue;
  renderAllDynamicFields: () => React.ReactNode;
  handleCancel: () => void;
  handleSubmit: () => void;
}) {
  return (
    <div className="p-3 bg-gray-50/50 border border-gray-200 rounded-lg space-y-3">
      {/* Issue Type Selector */}
      <div className="flex items-center gap-2">
        <IssueTypePicker
          issueTypes={issueTypes}
          selectedIssueType={selectedIssueType}
          onSelect={(issueType) => setSelectedIssueType(issueType)}
          placeholder="Select issue type"
          showBorder={true}
        />
      </div>

      {/* Title */}
      <div>
        <Input
          value={newSubtaskTitle}
          onChange={(e) => setNewSubtaskTitle(e.target.value)}
          placeholder="Subtask title"
          className="text-lg font-medium border-none bg-transparent px-3 py-2 -mx-3 -my-2 focus:ring-0 focus:border-none shadow-none"
          autoFocus
        />
      </div>

      {/* Description */}
      <div>
        {!newSubtaskDescription ? (
          <div 
            className="text-sm text-gray-400 cursor-text hover:bg-gray-50/30 rounded-md px-3 py-2 -mx-3 -my-2 transition-colors min-h-[60px] flex items-center"
            onClick={(e) => {
              const target = e.currentTarget;
              target.contentEditable = 'true';
              target.focus();
              target.textContent = '';
              target.className = "text-sm outline-none cursor-text hover:bg-gray-50/30 rounded-md px-3 py-2 -mx-3 -my-2 transition-colors min-h-[60px]";
            }}
          >
            Add description...
          </div>
        ) : (
          <div 
            className="text-sm outline-none cursor-text hover:bg-gray-50/30 rounded-md px-3 py-2 -mx-3 -my-2 transition-colors min-h-[60px]"
            contentEditable
            suppressContentEditableWarning={true}
            onInput={(e) => setNewSubtaskDescription(e.currentTarget.textContent || '')}
            onBlur={(e) => {
              if (!e.currentTarget.textContent?.trim()) {
                setNewSubtaskDescription('');
              }
            }}
          >
            {newSubtaskDescription}
          </div>
        )}
      </div>
      
      {/* Dynamic Fields Row */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">#{parentIssue.identifier}</span>
          {renderAllDynamicFields()}
        </div>
        
        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleCancel}
            className="h-7 px-3 text-xs"
          >
            Cancel
          </Button>
          <Button 
            size="sm" 
            onClick={handleSubmit}
            disabled={!newSubtaskTitle.trim()}
            className="h-7 px-3 text-xs bg-black text-white hover:bg-gray-800"
          >
            Create
          </Button>
        </div>
      </div>
    </div>
  );
}

export function IssueSubTasks({ 
  subTasks, 
  workspaceUrl, 
  parentIssue,
  issueTypes,
  states,
  members,
  projects,
  fieldConfigurations = [],
  onSubtaskCreated,
  onSubtaskUpdated,
  onHideInterface,
  autoStartCreation = false
}: IssueSubTasksProps) {
  // Debug component props
  useEffect(() => {
    console.log('🏗️ IssueSubTasks component props:');
    console.log('  - parentIssue:', parentIssue);
    console.log('  - issueTypes:', issueTypes);
    console.log('  - fieldConfigurations:', fieldConfigurations);
    console.log('  - states:', states);
    console.log('  - members:', members);
    console.log('  - projects:', projects);
  }, [parentIssue, issueTypes, fieldConfigurations, states, members, projects]);
  const [isOpen, setIsOpen] = useState(true);
  const [showInlineCreator, setShowInlineCreator] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [newSubtaskDescription, setNewSubtaskDescription] = useState('');
  const [selectedIssueType, setSelectedIssueType] = useState<IssueType | null>(null);
  const [selectedState, setSelectedState] = useState<State | null>(null);
  const [selectedAssignee, setSelectedAssignee] = useState<User | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedPriority, setSelectedPriority] = useState<string>('MEDIUM');
  const [availableStates, setAvailableStates] = useState<State[]>(states);
  
  // Use action hooks
  const { createIssue } = useCreateIssue();
  const { updateIssue } = useUpdateIssue();
  
  // Query for states based on selected issue type
  const { data: statesData } = useActionQuery<State[]>(
    `issueType.${selectedIssueType?.id}.states`,
    { enabled: !!selectedIssueType }
  );
  
  // Debug states data
  useEffect(() => {
    console.log('📊 States data effect:');
    console.log('  - selectedIssueType:', selectedIssueType);
    console.log('  - selectedIssueType?.id:', selectedIssueType?.id);
    console.log('  - statesData:', statesData);
    console.log('  - availableStates:', availableStates);
  }, [selectedIssueType, statesData, availableStates]);

  // Query for field configurations based on selected issue type's field set
  const { data: fieldSetConfigurations } = useActionQuery<FieldConfiguration[]>(
    `fieldSet.${selectedIssueType?.fieldSetId}.configurations`,
    { enabled: !!selectedIssueType?.fieldSetId }
  );
  
  // Debug field set configurations
  useEffect(() => {
    console.log('📊 Field set configurations effect:');
    console.log('  - selectedIssueType:', selectedIssueType);
    console.log('  - selectedIssueType?.fieldSetId:', selectedIssueType?.fieldSetId);
    console.log('  - fieldSetConfigurations:', fieldSetConfigurations);
    console.log('  - fieldConfigurations (fallback):', fieldConfigurations);
  }, [selectedIssueType, fieldSetConfigurations, fieldConfigurations]);

  // Function to fetch states for a specific issue type (replaced with action query)
  const fetchStatesForIssueType = async (issueTypeId: string) => {
    // This is now handled by the useActionQuery hook above
    // But we keep this function for backward compatibility
    return statesData || states;
  };

  // Auto-start creation if requested
  useEffect(() => {
    if (autoStartCreation && !showInlineCreator) {
      setShowInlineCreator(true);
    }
  }, [autoStartCreation, showInlineCreator]);

  // Set defaults when inline creator opens
  useEffect(() => {
    if (showInlineCreator && issueTypes.length > 0 && !selectedIssueType) {
      // ALWAYS default to parent's issue type first
      const defaultType = parentIssue.issueType || 
                          issueTypes.find(type => type.icon === 'subtask') || 
                          issueTypes[0];
      setSelectedIssueType(defaultType);
    }
    if (showInlineCreator && parentIssue.projectId && projects.length > 0 && !selectedProject) {
      const parentProject = projects.find(p => p.id === parentIssue.projectId);
      setSelectedProject(parentProject || null);
    }
  }, [showInlineCreator, issueTypes, parentIssue.issueType, parentIssue.projectId, projects, selectedIssueType, selectedProject]);

  // Update available states when issue type changes or data is fetched
  useEffect(() => {
    if (statesData) {
      setAvailableStates(statesData);
      
      // Reset selected state if it's not available for this issue type
      if (selectedState && !statesData.find((s: State) => s.id === selectedState.id)) {
        const defaultState = statesData.find((state: State) => state.type === 'UNSTARTED') || statesData[0];
        setSelectedState(defaultState || null);
      } else if (!selectedState && statesData.length > 0) {
        // Set default state if none is selected
        const defaultState = statesData.find((state: State) => state.type === 'UNSTARTED') || statesData[0];
        setSelectedState(defaultState);
      }
    } else {
      // No issue type selected, use all states
      setAvailableStates(states);
    }
  }, [statesData, states, selectedState]);

  const handleCreateSubTask = () => {
    setShowInlineCreator(true);
  };

  const handleSubtaskCreated = (newSubtask: SubTask) => {
    onSubtaskCreated?.(newSubtask);
    setShowInlineCreator(false);
    // Reset form
    setNewSubtaskTitle('');
    setNewSubtaskDescription('');
    setSelectedIssueType(null);
    setSelectedState(null);
    setSelectedAssignee(null);
    setSelectedProject(null);
    setSelectedPriority('MEDIUM');
  };

  const handleCancel = () => {
    setShowInlineCreator(false);
    // Reset form
    setNewSubtaskTitle('');
    setNewSubtaskDescription('');
    setSelectedIssueType(null);
    setSelectedState(null);
    setSelectedAssignee(null);
    setSelectedProject(null);
    setSelectedPriority('MEDIUM');
    
    // If there are no subtasks, hide the entire interface
    if (subTasks.length === 0) {
      onHideInterface?.();
    }
  };

  const handleSubmit = async () => {
    if (!newSubtaskTitle.trim()) {
      return;
    }

    // Use defaults if not set
    const defaultIssueType = selectedIssueType || 
                            parentIssue.issueType || 
                            issueTypes.find(type => type.icon === 'subtask') || 
                            issueTypes[0];
    const defaultState = selectedState || 
                        availableStates.find(state => state.type === 'UNSTARTED') || 
                        availableStates[0];

    const requestData = {
      title: newSubtaskTitle,
      description: newSubtaskDescription || '',
      parentId: parentIssue.id,
      teamId: parentIssue.teamId,
      issueTypeId: defaultIssueType?.id || undefined,
      // Only include fields that are configured in the field set
      ...(shouldShowFieldForSubtask('state') && { stateId: defaultState?.id || undefined }),
      ...(shouldShowFieldForSubtask('project') && { projectId: selectedProject?.id || undefined }),
      ...(shouldShowFieldForSubtask('assignee') && { assigneeId: selectedAssignee?.id || undefined }),
      ...(shouldShowFieldForSubtask('priority') && { priority: selectedPriority || 'MEDIUM' }),
    };

    // Filter out undefined values
    const cleanedRequestData = Object.fromEntries(
      Object.entries(requestData).filter(([_, value]) => value !== undefined)
    );

    try {
      await createIssue(cleanedRequestData);
      toast.success('Subtask created successfully');
      
      // Handle success - for now just trigger the callback
      handleSubtaskCreated({
        id: 'temp-id', // This will be replaced with actual data from mutation callback
        title: newSubtaskTitle,
        description: newSubtaskDescription,
        identifier: 'TEMP',
        assignee: selectedAssignee,
        state: defaultState!,
        issueType: defaultIssueType,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error creating subtask:', error);
      toast.error('Failed to create subtask');
    }
  };

  const handleUpdateSubTask = async (id: string, title: string, description?: string) => {
    try {
      await updateIssue(id, {
        title,
        description,
      });
      
      // Show success message
      toast.success('Subtask updated successfully');
      
      // Handle success - for now just trigger the callback with updated data
      onSubtaskUpdated?.({
        id,
        title,
        description,
        identifier: 'TEMP',
        assignee: null,
        state: availableStates[0],
        issueType: null,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating subtask:', error);
      toast.error('Failed to update subtask');
    }
  };

  // Helper function to get subtask field configurations
  const getSubtaskFieldConfigurations = () => {
    // Use field set configurations from the selected issue type if available
    const configs = fieldSetConfigurations || fieldConfigurations;
    console.log('🔍 Debug field configs:');
    console.log('  - fieldSetConfigurations:', fieldSetConfigurations);
    console.log('  - fieldConfigurations (fallback):', fieldConfigurations);
    console.log('  - selectedIssueType:', selectedIssueType);
    console.log('  - selectedIssueType.fieldSetId:', selectedIssueType?.fieldSetId);
    console.log('  - configs (final):', configs);
    
    if (configs.length === 0) {
      // Return default subtask field configurations if none are available
      // Only include fields that are actually implemented in the render switch
      const defaultSubtaskFields = [
        { fieldKey: 'title', isRequired: true, showOnSubtask: true, showOnNewIssue: true, displayOrder: 0 },
        { fieldKey: 'description', isRequired: false, showOnSubtask: true, showOnNewIssue: true, displayOrder: 1 },
        { fieldKey: 'state', isRequired: true, showOnSubtask: true, showOnNewIssue: true, displayOrder: 2 },
        { fieldKey: 'assignee', isRequired: false, showOnSubtask: true, showOnNewIssue: true, displayOrder: 3 },
        { fieldKey: 'project', isRequired: false, showOnSubtask: true, showOnNewIssue: true, displayOrder: 4 }
      ];
      
      const subtaskConfigs = defaultSubtaskFields
        .filter(config => config.showOnSubtask)
        .sort((a, b) => a.displayOrder - b.displayOrder);
      
      console.log('  - using default subtask configs:', subtaskConfigs);
      return subtaskConfigs;
    }
    
    const subtaskConfigs = configs
      .filter(config => config.showOnSubtask)
      .sort((a, b) => a.displayOrder - b.displayOrder);
    
    console.log('  - subtaskConfigs (filtered):', subtaskConfigs);
    return subtaskConfigs;
  };

  // Helper function to check if a field should be shown for subtasks
  const shouldShowFieldForSubtask = (fieldKey: string) => {
    const configs = fieldSetConfigurations || fieldConfigurations;
    console.log(`🔍 shouldShowFieldForSubtask('${fieldKey}'):`);
    console.log('  - configs:', configs);
    console.log('  - configs.length:', configs.length);
    
    if (configs.length === 0) {
      // Fallback to default subtask fields based on implemented fields
      // These match the defaultSubtaskFields in getSubtaskFieldConfigurations
      const defaultSubtaskFields = ['title', 'description', 'state', 'assignee', 'project'];
      const result = defaultSubtaskFields.includes(fieldKey);
      console.log('  - using default subtask fields, result:', result);
      return result;
    }
    
    const result = configs.some(config => config.fieldKey === fieldKey && config.showOnSubtask);
    console.log('  - checking configs, result:', result);
    return result;
  };

  // Render all dynamic fields including state in a clean horizontal row
  const renderAllDynamicFields = () => {
    const subtaskFields = getSubtaskFieldConfigurations();
    
    console.log('🎨 renderAllDynamicFields called');
    console.log('  - subtaskFields:', subtaskFields);
    
    const fieldsToRender = subtaskFields
      .filter(config => !['title', 'description'].includes(config.fieldKey));
    
    console.log('  - fieldsToRender (after filtering):', fieldsToRender);
    
    return (
      <div className="flex items-center gap-3 flex-wrap">
        {fieldsToRender.map(config => {
          console.log('  - rendering field:', config.fieldKey);
            switch (config.fieldKey) {
              case 'state':
                return (
                  <div key="state" className="flex flex-col gap-1">
                    <span className="text-xs text-gray-500">Status</span>
                    <StatusSelector
                      states={availableStates}
                      selectedState={selectedState}
                      onSelect={(state) => setSelectedState(state)}
                      placeholder="Select status"
                      showBorder={true}
                    />
                  </div>
                );
              
              case 'priority':
                return (
                  <div key="priority" className="flex flex-col gap-1">
                    <span className="text-xs text-gray-500">Priority</span>
                    <Select 
                      value={selectedPriority || 'MEDIUM'}
                      onValueChange={(value) => setSelectedPriority(value)}
                    >
                      <SelectTrigger variant="button" hideChevron className="h-7 px-2 text-xs">
                        <SelectValue>
                          <span className="text-xs">
                            {selectedPriority === 'NO_PRIORITY' ? 'No Priority' :
                             selectedPriority === 'LOW' ? 'Low' :
                             selectedPriority === 'MEDIUM' ? 'Medium' :
                             selectedPriority === 'HIGH' ? 'High' :
                             selectedPriority === 'URGENT' ? 'Urgent' : 'Medium'}
                          </span>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NO_PRIORITY">No Priority</SelectItem>
                        <SelectItem value="LOW">Low</SelectItem>
                        <SelectItem value="MEDIUM">Medium</SelectItem>
                        <SelectItem value="HIGH">High</SelectItem>
                        <SelectItem value="URGENT">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                );
              
              case 'assignee':
                return (
                  <div key="assignee" className="flex flex-col gap-1">
                    <span className="text-xs text-gray-500">Assignee</span>
                    <Select 
                      value={selectedAssignee?.id || ''}
                      onValueChange={(value) => {
                        const assignee = members.find(m => m.id === value);
                        setSelectedAssignee(assignee || null);
                      }}
                    >
                      <SelectTrigger variant="button" hideChevron className="h-7 px-2 text-xs">
                        <SelectValue placeholder="Unassigned">
                          {selectedAssignee ? (
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              <span className="text-xs">{selectedAssignee.name || selectedAssignee.email}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-500">Unassigned</span>
                          )}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Unassigned</SelectItem>
                        {members.map(member => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.name || member.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                );
              
              case 'project':
                return (
                  <div key="project" className="flex flex-col gap-1">
                    <span className="text-xs text-gray-500">Project</span>
                    <Select 
                      value={selectedProject?.id || ''}
                      onValueChange={(value) => {
                        const project = projects.find(p => p.id === value);
                        setSelectedProject(project || null);
                      }}
                    >
                      <SelectTrigger variant="button" hideChevron className="h-7 px-2 text-xs">
                        <SelectValue placeholder="No project">
                          {selectedProject ? (
                            <span className="text-xs">{selectedProject.name}</span>
                          ) : (
                            <span className="text-xs text-gray-500">No project</span>
                          )}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No project</SelectItem>
                        {projects.map(project => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                );
              
              default:
                return null;
            }
          })}
      </div>
    );
  };

  const completedSubTasks = subTasks.filter(task => task.state.type === 'COMPLETED').length;
  const progressPercentage = subTasks.length > 0 ? (completedSubTasks / subTasks.length) * 100 : 0;

  if (subTasks.length === 0) {
    return (
      <div className="px-6 py-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-medium text-gray-900">Sub-tasks</h3>
            {!showInlineCreator && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCreateSubTask}
                className="flex items-center gap-2 h-8"
                data-testid="add-subtask-button"
              >
                <Plus className="h-4 w-4" />
                Add sub-task
              </Button>
            )}
          </div>
        </div>

        {showInlineCreator && (
          <SubtaskCreationForm 
            newSubtaskTitle={newSubtaskTitle}
            setNewSubtaskTitle={setNewSubtaskTitle}
            newSubtaskDescription={newSubtaskDescription}
            setNewSubtaskDescription={setNewSubtaskDescription}
            selectedIssueType={selectedIssueType}
            setSelectedIssueType={setSelectedIssueType}
            issueTypes={issueTypes}
            parentIssue={parentIssue}
            renderAllDynamicFields={renderAllDynamicFields}
            handleCancel={handleCancel}
            handleSubmit={handleSubmit}
          />
        )}
      </div>
    );
  }

  return (
    <div className="px-6 py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 p-0 h-auto hover:bg-transparent"
          >
            {isOpen ? (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-400" />
            )}
            <h3 className="text-base font-medium text-gray-900">
              Sub-tasks ({completedSubTasks}/{subTasks.length})
            </h3>
          </Button>
          
          {!showInlineCreator && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCreateSubTask}
              className="flex items-center gap-2 h-8"
              data-testid="add-subtask-button"
            >
              <Plus className="h-4 w-4" />
              Add sub-task
            </Button>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span className="font-medium">Progress</span>
          <span className="font-mono">{Math.round(progressPercentage)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div
            className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {isOpen && (
        <div className="space-y-1">
          {subTasks.map((subTask) => (
            <SubTaskRow
              key={subTask.id}
              subTask={subTask}
              workspaceUrl={workspaceUrl}
              onUpdate={handleUpdateSubTask}
            />
          ))}
        </div>
      )}

            {/* Inline creator for when there are existing subtasks */}
      {showInlineCreator && (
        <div className="mb-4">
          <SubtaskCreationForm 
            newSubtaskTitle={newSubtaskTitle}
            setNewSubtaskTitle={setNewSubtaskTitle}
            newSubtaskDescription={newSubtaskDescription}
            setNewSubtaskDescription={setNewSubtaskDescription}
            selectedIssueType={selectedIssueType}
            setSelectedIssueType={setSelectedIssueType}
            issueTypes={issueTypes}
            parentIssue={parentIssue}
            renderAllDynamicFields={renderAllDynamicFields}
            handleCancel={handleCancel}
            handleSubmit={handleSubmit}
          />
        </div>
      )}
    </div>
  );
} 