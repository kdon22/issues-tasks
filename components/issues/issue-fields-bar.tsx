"use client";

import { formatDistance } from 'date-fns';
import { User, Calendar } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface User {
  id: string;
  name: string | null;
  email: string;
  avatarColor?: string | null;
  avatarType?: string | null;
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
}

interface FieldConfiguration {
  fieldKey: string;
  isRequired: boolean;
  showOnSubtask: boolean;
  showOnNewIssue: boolean;
  displayOrder: number;
}

interface IssueFieldsBarProps {
  issue: Issue;
  fieldConfigurations?: FieldConfiguration[];
  onAssigneeChange: () => void;
  onStatusChange: () => void;
  onPriorityChange: () => void;
}

export function IssueFieldsBar({
  issue,
  fieldConfigurations = [],
  onAssigneeChange,
  onStatusChange,
  onPriorityChange,
}: IssueFieldsBarProps) {
  const isOverdue = issue.dueDate && new Date(issue.dueDate) < new Date();

  // Helper function to check if a field should be shown
  const shouldShowField = (fieldKey: string) => {
    if (fieldConfigurations.length === 0) {
      // Fallback to showing default fields if no configuration
      return ['assignee', 'state', 'priority', 'project', 'dueDate', 'team', 'creator'].includes(fieldKey);
    }
    return fieldConfigurations.some(config => config.fieldKey === fieldKey);
  };

  // Sort fields by display order
  const getSortedFields = () => {
    if (fieldConfigurations.length === 0) {
      return ['assignee', 'state', 'priority', 'project', 'dueDate', 'team', 'creator'];
    }
    return fieldConfigurations
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map(config => config.fieldKey);
  };

  const sortedFields = getSortedFields();

  // Render field components
  const renderField = (fieldKey: string) => {
    if (!shouldShowField(fieldKey)) return null;

    switch (fieldKey) {
      case 'assignee':
        return (
          <div key="assignee" className="space-y-2">
            <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
              Assignee
            </label>
            {issue.assignee ? (
              <Button
                variant="ghost"
                onClick={onAssigneeChange}
                className="w-full justify-start p-0 h-auto hover:bg-gray-100"
              >
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback 
                      className="text-xs"
                      style={{ backgroundColor: issue.assignee.avatarColor || '#6B7280' }}
                    >
                                                {(issue.assignee.name || issue.assignee.email).charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-gray-900">
                    {issue.assignee.name || issue.assignee.email}
                  </span>
                </div>
              </Button>
            ) : (
              <Button
                variant="ghost"
                onClick={onAssigneeChange}
                className="w-full justify-start p-0 h-auto text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              >
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="text-sm">Unassigned</span>
                </div>
              </Button>
            )}
          </div>
        );

      case 'state':
        return (
          <div key="state" className="space-y-2">
            <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
              Status
            </label>
            <Button
              variant="ghost"
              onClick={onStatusChange}
              className="w-full justify-start p-0 h-auto hover:bg-gray-100"
            >
              <div className="flex items-center gap-2">
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: issue.state.color || '#6B7280' }}
                />
                <span className="text-sm text-gray-900">
                  {issue.state.name || 'No Status'}
                </span>
              </div>
            </Button>
          </div>
        );

      case 'priority':
        return (
          <div key="priority" className="space-y-2">
            <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
              Priority
            </label>
            <Button
              variant="ghost"
              onClick={onPriorityChange}
              className="w-full justify-start p-0 h-auto hover:bg-gray-100"
            >
              <span className="text-sm text-gray-900 capitalize">
                {issue.priority.toLowerCase().replace('_', ' ')}
              </span>
            </Button>
          </div>
        );

      case 'project':
        return issue.project ? (
          <div key="project" className="space-y-2">
            <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
              Project
            </label>
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded"
                style={{ backgroundColor: issue.project.color || '#6B7280' }}
              />
              <span className="text-sm text-gray-900">{issue.project.name}</span>
            </div>
          </div>
        ) : null;

      case 'dueDate':
        return issue.dueDate ? (
          <div key="dueDate" className="space-y-2">
            <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
              Due date
            </label>
            <div className={cn(
              "flex items-center gap-2 text-sm",
              isOverdue ? "text-red-600" : "text-gray-900"
            )}>
              <Calendar className="h-4 w-4" />
              <span>
                {formatDistance(new Date(issue.dueDate), new Date(), { addSuffix: true })}
              </span>
            </div>
          </div>
        ) : null;

      case 'team':
        return (
          <div key="team" className="space-y-2">
            <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
              Team
            </label>
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded"
                style={{ backgroundColor: issue.team.avatarColor || '#6B7280' }}
              />
              <span className="text-sm text-gray-900">{issue.team.name}</span>
            </div>
          </div>
        );

      case 'creator':
        return (
          <div key="creator" className="space-y-2">
            <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
              Reporter
            </label>
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback 
                  className="text-xs"
                  style={{ backgroundColor: issue.creator.avatarColor || '#6B7280' }}
                >
                                            {(issue.creator.name || issue.creator.email).charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-gray-900">
                {issue.creator.name || issue.creator.email}
              </span>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-64 flex-shrink-0 bg-gray-50 border-l border-gray-200 overflow-y-auto">
      <div className="p-4 space-y-6">
        {sortedFields.map(fieldKey => renderField(fieldKey))}
        
        {/* Always show created/updated at bottom */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
            Created
          </label>
          <span className="text-sm text-gray-900">
            {formatDistance(new Date(issue.createdAt), new Date(), { addSuffix: true })}
          </span>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
            Updated
          </label>
          <span className="text-sm text-gray-900">
            {formatDistance(new Date(issue.updatedAt), new Date(), { addSuffix: true })}
          </span>
        </div>
      </div>
    </div>
  );
} 