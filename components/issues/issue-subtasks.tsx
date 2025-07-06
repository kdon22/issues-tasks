"use client";

import { useState, useEffect } from 'react';
import { Plus, ChevronDown, ChevronRight, User, Save, X, Paperclip } from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { StateBadge } from '@/components/ui/state-badge';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Input } from '@/components/ui/input';
import { IssueTypeIcon } from './issue-type-picker';
import { cn } from '@/lib/utils';

interface User {
  id: string;
  name: string | null;
  email: string;
}

interface State {
  id: string;
  name: string;
  color: string;
  type: string;
}

interface IssueType {
  id: string;
  name: string;
  icon?: string | null;
  color: string;
  description?: string | null;
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

interface IssueSubTasksProps {
  subTasks: SubTask[];
  workspaceUrl: string;
  parentIssue: Issue;
  issueTypes: IssueType[];
  states: State[];
  members: User[];
  projects: Project[];
  onSubtaskCreated?: (subtask: SubTask) => void;
  onSubtaskUpdated?: (subtask: SubTask) => void;
  onCreateSubtaskClick?: () => void;
  onHideInterface?: () => void;
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
                <Save className="h-4 w-4 mr-1" />
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
          
          <RichTextEditor
            content={editedDescription}
            onChange={setEditedDescription}
            placeholder="Add a description..."
            className="min-h-[120px]"
            minimal={false}
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
            href={`/workspace/${workspaceUrl}/issues/${subTask.id}`}
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
                  <RichTextEditor
                    content={subTask.description}
                    editable={false}
                    minimal={true}
                    className="border-none bg-transparent p-0"
                  />
                </div>
              )}
            </div>
            
            <div className="ml-2">
              <Link 
                href={`/workspace/${workspaceUrl}/issues/${subTask.id}`}
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

export function IssueSubTasks({ 
  subTasks, 
  workspaceUrl, 
  parentIssue,
  issueTypes,
  states,
  members,
  projects,
  onSubtaskCreated,
  onSubtaskUpdated,
  onHideInterface
}: IssueSubTasksProps) {
  console.log('🟢 IssueSubTasks component rendered');
  console.log('🟢 Props:', { subTasks: subTasks.length, workspaceUrl, parentIssue, issueTypes: issueTypes.length, states: states.length });
  
  const [isOpen, setIsOpen] = useState(true);
  const [showInlineCreator, setShowInlineCreator] = useState(subTasks.length === 0);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [newSubtaskDescription, setNewSubtaskDescription] = useState('');
  
  console.log('🟣 Current state - newSubtaskTitle:', newSubtaskTitle);
  console.log('🟣 Create button should be enabled:', !!newSubtaskTitle.trim());
  const [selectedIssueType, setSelectedIssueType] = useState<IssueType | null>(null);
  const [selectedState, setSelectedState] = useState<State | null>(null);
  const [selectedAssignee, setSelectedAssignee] = useState<User | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [availableStates, setAvailableStates] = useState<State[]>(states);

  // Function to fetch states for a specific issue type
  const fetchStatesForIssueType = async (issueTypeId: string) => {
    try {
      const response = await fetch(`/api/workspaces/${workspaceUrl}/issue-types/${issueTypeId}/states`);
      if (response.ok) {
        const result = await response.json();
        return result.data || [];
      }
    } catch (error) {
      console.error('Error fetching states for issue type:', error);
    }
    return states; // Fallback to all states
  };

  // Set defaults when inline creator opens
  useEffect(() => {
    if (showInlineCreator && issueTypes.length > 0 && !selectedIssueType) {
      // Default to parent's issue type if available, otherwise use subtask type
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

  // Update available states when issue type changes
  useEffect(() => {
    const updateStates = async () => {
      if (selectedIssueType) {
        const statesForType = await fetchStatesForIssueType(selectedIssueType.id);
        setAvailableStates(statesForType);
        
        // Reset selected state if it's not available for this issue type
        if (selectedState && !statesForType.find((s: State) => s.id === selectedState.id)) {
          const defaultState = statesForType.find((state: State) => state.type === 'UNSTARTED') || statesForType[0];
          setSelectedState(defaultState || null);
        } else if (!selectedState && statesForType.length > 0) {
          // Set default state if none is selected
          const defaultState = statesForType.find((state: State) => state.type === 'UNSTARTED') || statesForType[0];
          setSelectedState(defaultState);
        }
      } else {
        // No issue type selected, use all states
        setAvailableStates(states);
      }
    };

    updateStates();
  }, [selectedIssueType, states, selectedState]);

  const handleCreateSubTask = () => {
    console.log('🟡 Add sub-task button clicked - showing inline creator');
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
    
    // If there are no subtasks, hide the entire interface
    if (subTasks.length === 0) {
      onHideInterface?.();
    }
  };

  const handleSubmit = async () => {
    console.log('🚀 handleSubmit called');
    console.log('📝 newSubtaskTitle:', newSubtaskTitle);
    console.log('📝 newSubtaskDescription:', newSubtaskDescription);
    console.log('🎯 selectedIssueType:', selectedIssueType);
    console.log('🎯 selectedState:', selectedState);
    console.log('🎯 availableStates:', availableStates);
    console.log('👤 parentIssue:', parentIssue);
    
    if (!newSubtaskTitle.trim()) {
      console.log('❌ No title provided, exiting early');
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

    console.log('🔧 defaultIssueType:', defaultIssueType);
    console.log('🔧 defaultState:', defaultState);

    const requestData = {
      title: newSubtaskTitle,
      description: newSubtaskDescription || '',
      priority: 'MEDIUM',
      parentId: parentIssue.id,
      teamId: parentIssue.teamId,
      projectId: selectedProject?.id || null,
      stateId: defaultState?.id,
      issueTypeId: defaultIssueType?.id,
      assigneeId: selectedAssignee?.id || null,
    };

    console.log('📦 Request data:', requestData);

    try {
      const response = await fetch(`/api/workspaces/${workspaceUrl}/issues`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      console.log('🌐 Response status:', response.status);
      console.log('🌐 Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error:', errorText);
        throw new Error(`Failed to create subtask: ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Success result:', result);
      handleSubtaskCreated(result.data);
    } catch (error) {
      console.error('💥 Error creating subtask:', error);
    }
  };

  const handleUpdateSubTask = async (id: string, title: string, description?: string) => {
    try {
      const response = await fetch(`/api/workspaces/${workspaceUrl}/issues/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update subtask');
      }

      const result = await response.json();
      onSubtaskUpdated?.(result.data);
    } catch (error) {
      console.error('Error updating subtask:', error);
    }
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
              >
                <Plus className="h-4 w-4" />
                Add sub-task
              </Button>
            )}
          </div>
        </div>

        {showInlineCreator && (
          <div className="p-3 bg-gray-50/50 border border-gray-200 rounded-lg space-y-3">
            {/* Issue Type Selector at top */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  // TODO: Open issue type picker dropdown
                }}
                className="flex items-center gap-2 p-1 rounded hover:bg-gray-100 transition-colors"
                title="Select issue type"
              >
                {selectedIssueType && (
                  <IssueTypeIcon issueType={selectedIssueType} size="sm" />
                )}
              </button>
            </div>

            {/* Title - proper input field */}
            <div>
              <Input
                value={newSubtaskTitle}
                onChange={(e) => {
                  const newTitle = e.target.value;
                  console.log('🟦 Title input changed:', newTitle);
                  setNewSubtaskTitle(newTitle);
                }}
                placeholder="Issue title"
                className="text-lg font-medium border-none bg-transparent px-3 py-2 -mx-3 -my-2 focus:ring-0 focus:border-none shadow-none"
                autoFocus
              />
            </div>

            {/* Description - no border, inline editing style */}
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
            
            {/* Actions row - all in one line */}
            <div className="flex items-center gap-3 pt-2">
              {/* Left side - field buttons */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">#{parentIssue.identifier}</span>
                
                <button className="text-xs text-gray-600 hover:bg-gray-100 px-2 py-1 rounded transition-colors">
                  ••• Priority
                </button>
                
                <button className="flex items-center gap-1 text-xs text-gray-600 hover:bg-gray-100 px-2 py-1 rounded transition-colors">
                  <User className="h-3 w-3" />
                  Assignee
                </button>

                <button className="text-xs text-gray-600 hover:bg-gray-100 px-2 py-1 rounded transition-colors">
                  ⚠️
                </button>

                <button className="text-xs text-gray-600 hover:bg-gray-100 px-2 py-1 rounded transition-colors">
                  🔗
                </button>

                <button className="text-xs text-gray-600 hover:bg-gray-100 px-2 py-1 rounded transition-colors">
                  ▶️
                </button>

                <button className="text-xs text-gray-600 hover:bg-gray-100 px-2 py-1 rounded transition-colors">
                  •••
                </button>
              </div>
              
              <div className="flex-1" />
              
              {/* Right side - attach and action buttons */}
              <div className="flex items-center gap-2">
                <button className="text-xs text-gray-600 hover:bg-gray-100 px-2 py-1 rounded transition-colors flex items-center gap-1">
                  <Paperclip className="h-3 w-3" />
                </button>
                
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
                  onClick={() => {
                    console.log('🔴 Create button clicked!');
                    console.log('🔴 newSubtaskTitle:', newSubtaskTitle);
                    console.log('🔴 Button disabled?', !newSubtaskTitle.trim());
                    handleSubmit();
                  }}
                  disabled={!newSubtaskTitle.trim()}
                  className="h-7 px-3 text-xs bg-black text-white hover:bg-gray-800"
                >
                  Create
                </Button>
              </div>
            </div>
          </div>
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
        <div className="p-3 bg-gray-50/50 border border-gray-200 rounded-lg space-y-3 mb-4">
          {/* Issue Type Selector at top */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                // TODO: Open issue type picker dropdown
              }}
              className="flex items-center gap-2 p-1 rounded hover:bg-gray-100 transition-colors"
              title="Select issue type"
            >
              {selectedIssueType && (
                <IssueTypeIcon issueType={selectedIssueType} size="sm" />
              )}
            </button>
          </div>

          {/* Title - proper input field */}
          <div>
            <Input
              value={newSubtaskTitle}
              onChange={(e) => {
                const newTitle = e.target.value;
                console.log('🟦 Title input changed (2nd instance):', newTitle);
                setNewSubtaskTitle(newTitle);
              }}
              placeholder="Issue title"
              className="text-lg font-medium border-none bg-transparent px-3 py-2 -mx-3 -my-2 focus:ring-0 focus:border-none shadow-none"
              autoFocus
            />
          </div>

          {/* Description - no border, inline editing style */}
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
          
          {/* Actions row - all in one line */}
          <div className="flex items-center gap-3 pt-2">
            {/* Left side - field buttons */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">#{parentIssue.identifier}</span>
              
              <button className="text-xs text-gray-600 hover:bg-gray-100 px-2 py-1 rounded transition-colors">
                ••• Priority
              </button>
              
              <button className="flex items-center gap-1 text-xs text-gray-600 hover:bg-gray-100 px-2 py-1 rounded transition-colors">
                <User className="h-3 w-3" />
                Assignee
              </button>

              <button className="text-xs text-gray-600 hover:bg-gray-100 px-2 py-1 rounded transition-colors">
                ⚠️
              </button>

              <button className="text-xs text-gray-600 hover:bg-gray-100 px-2 py-1 rounded transition-colors">
                🔗
              </button>

              <button className="text-xs text-gray-600 hover:bg-gray-100 px-2 py-1 rounded transition-colors">
                ▶️
              </button>

              <button className="text-xs text-gray-600 hover:bg-gray-100 px-2 py-1 rounded transition-colors">
                •••
              </button>
            </div>
            
            <div className="flex-1" />
            
            {/* Right side - attach and action buttons */}
            <div className="flex items-center gap-2">
              <button className="text-xs text-gray-600 hover:bg-gray-100 px-2 py-1 rounded transition-colors flex items-center gap-1">
                <Paperclip className="h-3 w-3" />
              </button>
              
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
                onClick={() => {
                  console.log('🔴 Create button clicked!');
                  console.log('🔴 newSubtaskTitle:', newSubtaskTitle);
                  console.log('🔴 Button disabled?', !newSubtaskTitle.trim());
                  handleSubmit();
                }}
                disabled={!newSubtaskTitle.trim()}
                className="h-7 px-3 text-xs bg-black text-white hover:bg-gray-800"
              >
                Create
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 