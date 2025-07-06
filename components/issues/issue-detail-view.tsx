"use client";

import { useState } from 'react';
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

  const isOverdue = issue.dueDate && new Date(issue.dueDate) < new Date();

  // Placeholder handlers for IssueFieldsBar
  const handleAssigneeChange = () => {
    // TODO: Implement assignee change
    console.log('Change assignee:', issue.id);
  };

  const handleStatusChange = () => {
    // TODO: Implement status change
    console.log('Change status:', issue.id);
  };

  const handlePriorityChange = () => {
    // TODO: Implement priority change
    console.log('Change priority:', issue.id);
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
                    const response = await fetch(`/api/workspaces/${workspace.url}/issues/${issue.id}`, {
                      method: 'PUT',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        title: newTitle,
                      }),
                    });

                    if (!response.ok) {
                      throw new Error('Failed to update title');
                    }

                    const result = await response.json();
                    console.log('Title updated successfully:', result);
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
                    const response = await fetch(`/api/workspaces/${workspace.url}/issues/${issue.id}`, {
                      method: 'PUT',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        description: newDescription,
                      }),
                    });

                    if (!response.ok) {
                      throw new Error('Failed to update description');
                    }

                    const result = await response.json();
                    console.log('Description updated successfully:', result);
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
                  onSubtaskCreated={(newSubtask: SubTask) => {
                    // Add the new subtask to the issue children
                    issue.children.push(newSubtask);
                    // Update the count
                    issue._count.children += 1;
                  }}
                  onSubtaskUpdated={(updatedSubtask: SubTask) => {
                    // Update the subtask in the issue children
                    const index = issue.children.findIndex(child => child.id === updatedSubtask.id);
                    if (index !== -1) {
                      issue.children[index] = updatedSubtask;
                    }
                  }}
                  onCreateSubtaskClick={() => setShowSubtasksInterface(true)}
                  onHideInterface={() => setShowSubtasksInterface(false)}
                />
              </div>
            ) : (
              <div className="px-6 py-3 border-b border-gray-100">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSubtasksInterface(true)}
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
          onAssigneeChange={handleAssigneeChange}
          onStatusChange={handleStatusChange}
          onPriorityChange={handlePriorityChange}
        />
    </div>
  );
} 