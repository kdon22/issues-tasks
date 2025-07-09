"use client";

import { useState, useEffect } from 'react';
import { formatDistance } from 'date-fns';
import { Tag, Plus } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PriorityBadge } from '@/components/ui/priority-badge';
import { StateBadge } from '@/components/ui/state-badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { IssueComments } from './issue-comments';
import { IssueActivity } from './issue-activity';
import { IssueSubTasks } from './issue-subtasks';
import { IssueFieldsBar } from './issue-fields-bar';
import { IssueTitle } from './issue-title';
import { IssueDescription } from './issue-description';
import { cn } from '@/lib/utils';
import { useUpdateIssue } from '@/lib/hooks';

interface User {
  id: string;
  name: string | null;
  email: string;
  avatarColor?: string | null;
  avatarType?: string | null;
}

interface Reaction {
  id: string;
  emoji: string;
  count: number;
  users: User[];
  hasReacted: boolean;
}

interface Team {
  id: string;
  name: string;
  identifier: string;
  avatarColor?: string | null;
}

interface Project {
  id: string;
  name: string;
  identifier: string;
  color?: string | null;
}

interface State {
  id: string;
  name: string;
  color: string;
  type: string;
}

interface Label {
  id: string;
  name: string;
  color: string;
  description?: string | null;
}

interface IssueType {
  id: string;
  name: string;
  icon?: string | null;
  fieldSetId?: string | null;
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: User;
  reactions: Reaction[];
  replies?: Comment[];
}

interface Activity {
  id: string;
  type: string;
  data: any;
  createdAt: string;
  user: User;
}

interface Attachment {
  id: string;
  filename: string;
  url: string;
  mimetype: string;
  size: number;
  createdAt: string;
  user: User;
}

interface SubTask {
  id: string;
  title: string;
  identifier: string;
  assignee?: User | null;
  state: State;
  createdAt: string;
}

interface Issue {
  id: string;
  title: string;
  description?: string | null;
  identifier: string;
  number: number;
  priority: string;
  estimate?: number | null;
  dueDate?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  canceledAt?: string | null;
  createdAt: string;
  updatedAt: string;
  creator: User;
  assignee?: User | null;
  team: Team;
  project?: Project | null;
  state: State;
  issueType: IssueType;
  parent?: {
    id: string;
    title: string;
    identifier: string;
    number: number;
    parent?: {
      id: string;
      title: string;
      identifier: string;
      number: number;
    } | null;
  } | null;
  labels: Array<{
    id: string;
    label: Label;
  }>;
  comments: Comment[];
  attachments: Attachment[];
  children: SubTask[];
  activities: Activity[];
  _count: {
    comments: number;
    attachments: number;
    children: number;
  };
  fieldConfigurations?: any[]; // Added for field configurations
}

interface Workspace {
  id: string;
  name: string;
  url: string;
}

interface WorkspaceMember {
  id: string;
  user: User;
}

interface IssueDetailViewProps {
  issue: Issue;
  workspace: Workspace;
  members: WorkspaceMember[];
  teams: Team[];
  projects: Project[];
  states: State[];
  issueTypes: IssueType[];
  currentUserId: string;
}

export function IssueDetailView({
  issue,
  workspace,
  members,
  teams,
  projects,
  states,
  issueTypes,
  currentUserId,
}: IssueDetailViewProps) {
  const [activeTab, setActiveTab] = useState('comments');
  const [showSubtasksInterface, setShowSubtasksInterface] = useState(false);
  const [autoStartSubtaskCreation, setAutoStartSubtaskCreation] = useState(false);
  
  // Use the new action-based hook for updating issues
  const { updateIssue } = useUpdateIssue();
  
  // Field configurations are now provided via the unified issue loader
  // No need for client-side fetching

  const isOverdue = issue.dueDate && new Date(issue.dueDate) < new Date();

  // Field configurations are now part of the prefetched issue data
  // If not available, fallback to empty array for graceful degradation
  const fieldConfigurations = issue.fieldConfigurations || [];

  // Issue field change handlers
  const handleAssigneeChange = async () => {
    // TODO: Implement assignee picker popup
    console.log('Change assignee:', issue.id);
    // For now, just show a placeholder
    const newAssigneeId = window.prompt('Enter new assignee ID (or leave empty to unassign):');
    if (newAssigneeId !== null) {
      try {
        // Use the new action-based system
        await updateIssue(issue.id, {
          assigneeId: newAssigneeId || null,
        });
        console.log('Assignee updated successfully');
        // Force re-render by updating a state
        setActiveTab(activeTab);
      } catch (error) {
        console.error('Failed to update assignee:', error);
      }
    }
  };

  const handleStatusChange = async () => {
    // TODO: Implement status picker popup
    console.log('Change status:', issue.id);
    // For now, just show a placeholder
    const newStateId = window.prompt('Enter new state ID:');
    if (newStateId) {
      try {
        // Use the new action-based system
        await updateIssue(issue.id, {
          stateId: newStateId,
        });
        console.log('Status updated successfully');
        // Force re-render by updating a state
        setActiveTab(activeTab);
      } catch (error) {
        console.error('Failed to update status:', error);
      }
    }
  };

  const handlePriorityChange = async () => {
    // TODO: Implement priority picker popup
    console.log('Change priority:', issue.id);
    // For now, just show a placeholder
    const priorities = ['NO_PRIORITY', 'LOW', 'MEDIUM', 'HIGH', 'URGENT'];
    const newPriority = window.prompt(`Enter new priority (${priorities.join(', ')}):`, issue.priority);
    if (newPriority && priorities.includes(newPriority.toUpperCase())) {
      try {
        // Use the new action-based system
        await updateIssue(issue.id, {
          priority: newPriority.toUpperCase(),
        });
        console.log('Priority updated successfully');
        // Force re-render by updating a state
        setActiveTab(activeTab);
      } catch (error) {
        console.error('Failed to update priority:', error);
      }
    }
  };

  return (
    <div className="h-full flex overflow-hidden">
        {/* Main content area - scrollable */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <div className="max-w-4xl mx-auto">
            {/* Title Section */}
            <div className="px-6 py-6 border-b border-gray-100">
              <IssueTitle
                title={issue.title}
                onTitleChange={async (newTitle: string) => {
                  try {
                    // Use the new action-based system
                    await updateIssue(issue.id, {
                      title: newTitle,
                    });
                    console.log('Title updated successfully');
                  } catch (error) {
                    console.error('Error updating title:', error);
                    throw error; // Re-throw so the auto-save hook can handle it
                  }
                }}
              />
              
              {/* Metadata row - inline with title */}
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-3">
                  <PriorityBadge priority={issue.priority as "NO_PRIORITY" | "LOW" | "MEDIUM" | "HIGH" | "URGENT"} />
                  <StateBadge state={issue.state.type as "BACKLOG" | "UNSTARTED" | "STARTED" | "COMPLETED" | "CANCELED"} />
                  <span className="text-sm text-gray-500 font-medium">
                    {issue.issueType.name}
                  </span>
                  
                  {/* Labels inline */}
                  {issue.labels.length > 0 && (
                    <>
                      <div className="w-px h-4 bg-gray-300 mx-1" />
                      <div className="flex items-center gap-1">
                        {issue.labels.map(({ label }) => (
                          <Badge
                            key={label.id}
                            variant="secondary"
                            className="text-xs h-5"
                            style={{ 
                              backgroundColor: `${label.color}15`,
                              color: label.color,
                              borderColor: `${label.color}30`
                            }}
                          >
                            {label.name}
                          </Badge>
                        ))}
                      </div>
                    </>
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  Created {formatDistance(new Date(issue.createdAt), new Date(), { addSuffix: true })}
                </div>
              </div>
            </div>

            {/* Description Section */}
            <div className="px-6 py-6 border-b border-gray-100">
              <IssueDescription
                description={issue.description}
                onDescriptionChange={async (newDescription: string) => {
                  try {
                    // Use the new action-based system instead of direct fetch
                    await updateIssue(issue.id, {
                      description: newDescription,
                    });
                    console.log('Description updated successfully');
                  } catch (error) {
                    console.error('Error updating description:', error);
                    throw error; // Re-throw so the auto-save hook can handle it
                  }
                }}
              />
            </div>

            {/* Sub tasks section */}
            {issue.children.length > 0 || showSubtasksInterface ? (
              <div className="border-b border-gray-100">
                <IssueSubTasks 
                  subTasks={issue.children}
                  workspaceUrl={workspace.url}
                  parentIssue={{
                    id: issue.id,
                    title: issue.title,
                    identifier: issue.identifier,
                    teamId: issue.team.id,
                    projectId: issue.project?.id || null,
                    issueType: issue.issueType
                  }}
                  issueTypes={issueTypes}
                  states={states}
                  members={members.map(m => ({
                    id: m.user.id,
                    name: m.user.name,
                    email: m.user.email
                  }))}
                  projects={projects}
                  fieldConfigurations={fieldConfigurations}
                  onSubtaskCreated={(newSubtask: SubTask) => {
                    // Add the new subtask to the issue children
                    issue.children.push(newSubtask);
                    // Update the count
                    issue._count.children += 1;
                    // Reset the auto-start flag
                    setAutoStartSubtaskCreation(false);
                  }}
                  onSubtaskUpdated={(updatedSubtask: SubTask) => {
                    // Update the subtask in the issue children
                    const index = issue.children.findIndex(child => child.id === updatedSubtask.id);
                    if (index !== -1) {
                      issue.children[index] = updatedSubtask;
                    }
                  }}
                  onCreateSubtaskClick={() => setShowSubtasksInterface(true)}
                  onHideInterface={() => {
                    setShowSubtasksInterface(false);
                    setAutoStartSubtaskCreation(false);
                  }}
                  autoStartCreation={autoStartSubtaskCreation}
                />
              </div>
            ) : (
              <div className="px-6 py-3 border-b border-gray-100">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    // Create a new subtask directly instead of showing the interface first
                    setShowSubtasksInterface(true);
                    setAutoStartSubtaskCreation(true);
                  }}
                  className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 h-8 px-3 text-sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Subtasks
                </Button>
              </div>
            )}

            {/* Comments & Activity Section */}
            <div className="px-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="border-b border-gray-100 -mx-6 px-6">
                  <TabsList className="grid w-full grid-cols-3 bg-transparent h-auto p-0">
                    <TabsTrigger 
                      value="all" 
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent py-4 text-sm font-medium"
                    >
                      All ({issue._count.comments + issue.activities.length})
                    </TabsTrigger>
                    <TabsTrigger 
                      value="comments" 
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent py-4 text-sm font-medium"
                    >
                      Comments ({issue._count.comments})
                    </TabsTrigger>
                    <TabsTrigger 
                      value="activity" 
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent py-4 text-sm font-medium"
                    >
                      Activity ({issue.activities.length})
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="all" className="py-6">
                  <div className="space-y-6">
                    <IssueComments 
                      comments={issue.comments}
                      issueId={issue.id}
                      workspaceUrl={workspace.url}
                      currentUserId={currentUserId}
                    />
                    <IssueActivity 
                      activities={issue.activities}
                      issueId={issue.id}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="comments" className="py-6">
                  <IssueComments 
                    comments={issue.comments}
                    issueId={issue.id}
                    workspaceUrl={workspace.url}
                    currentUserId={currentUserId}
                    onCommentsChange={(updatedComments) => {
                      // Update the issue comments in real-time
                      issue.comments = updatedComments;
                    }}
                  />
                </TabsContent>

                <TabsContent value="activity" className="py-6">
                  <IssueActivity 
                    activities={issue.activities}
                    issueId={issue.id}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>

        {/* Fields Bar - fixed width with independent scrolling */}
        <IssueFieldsBar
          issue={issue}
          fieldConfigurations={fieldConfigurations}
          onAssigneeChange={handleAssigneeChange}
          onStatusChange={handleStatusChange}
          onPriorityChange={handlePriorityChange}
        />
    </div>
  );
} 