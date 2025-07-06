// Issue Row Component - Linear Clone
"use client";

import { useState } from 'react';
import { formatDistance } from 'date-fns';
import { MoreHorizontal, MessageSquare, Calendar, User } from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PriorityBadge } from '@/components/ui/priority-badge';
import { StateBadge } from '@/components/ui/state-badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface Issue {
  id: string;
  title: string;
  identifier: string;
  number: number;
  priority: 'NO_PRIORITY' | 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  creator: {
    id: string;
    name?: string;
    email: string;
  };
  assignee?: {
    id: string;
    name?: string;
    email: string;
  };
  team: {
    id: string;
    name: string;
    identifier: string;
  };
  project?: {
    id: string;
    name: string;
    identifier: string;
    color?: string;
  };
  state: {
    id: string;
    name: string;
    color: string;
    type: 'BACKLOG' | 'UNSTARTED' | 'STARTED' | 'COMPLETED' | 'CANCELED';
  };
  labels: Array<{
    id: string;
    issueId: string;
    labelId: string;
    label: {
      id: string;
      name: string;
      color: string;
      description?: string;
    };
  }>;
  _count: {
    comments: number;
    attachments: number;
  };
}

interface IssueRowProps {
  issue: Issue;
  workspaceUrl: string;
  isLast: boolean;
  onUpdate: (issue: Issue) => void;
  onDelete: (issueId: string) => void;
}

export function IssueRow({ 
  issue, 
  workspaceUrl, 
  isLast, 
  onUpdate, 
  onDelete 
}: IssueRowProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleEdit = () => {
    // TODO: Open edit dialog
    console.log('Edit issue:', issue.id);
  };

  const handleDelete = () => {
    // TODO: Show confirmation dialog
    console.log('Delete issue:', issue.id);
    onDelete(issue.id);
  };

  const handleAssigneeChange = () => {
    // TODO: Open assignee selector
    console.log('Change assignee:', issue.id);
  };

  const handleStatusChange = () => {
    // TODO: Open status selector
    console.log('Change status:', issue.id);
  };

  const isOverdue = issue.dueDate && new Date(issue.dueDate) < new Date();

  return (
    <div 
      className={cn(
        "flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors cursor-pointer group",
        !isLast && "border-b border-gray-100"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Issue Identifier */}
      <div className="flex-shrink-0 w-20">
        <Link 
          href={`/workspace/${workspaceUrl}/issues/${issue.id}`}
          className="text-sm font-mono text-gray-500 hover:text-gray-700 transition-colors"
        >
          {issue.identifier}
        </Link>
      </div>

      {/* Priority indicator */}
      <div className="flex-shrink-0">
        <PriorityBadge priority={issue.priority} />
      </div>

      {/* Status */}
      <div className="flex-shrink-0">
        <StateBadge 
          state={issue.state.type}
        />
      </div>

      {/* Issue Title */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Link 
            href={`/workspace/${workspaceUrl}/issues/${issue.id}`}
            className="text-sm font-medium text-gray-900 hover:text-gray-700 transition-colors truncate"
          >
            {issue.title}
          </Link>
          
          {/* Labels */}
          {issue.labels.length > 0 && (
            <div className="flex items-center gap-1 flex-shrink-0">
              {issue.labels.slice(0, 3).map(({ label }) => (
                <Badge
                  key={label.id}
                  variant="secondary"
                  className="text-xs px-2 py-0.5"
                  style={{ 
                    backgroundColor: `${label.color}20`,
                    color: label.color,
                    borderColor: `${label.color}40`
                  }}
                >
                  {label.name}
                </Badge>
              ))}
              {issue.labels.length > 3 && (
                <Badge variant="secondary" className="text-xs px-2 py-0.5">
                  +{issue.labels.length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Project */}
      {issue.project && (
        <div className="flex-shrink-0">
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded"
              style={{ backgroundColor: issue.project.color || '#6B7280' }}
            />
            <span className="text-sm text-gray-600">
              {issue.project.name}
            </span>
          </div>
        </div>
      )}

      {/* Due Date */}
      {issue.dueDate && (
        <div className="flex-shrink-0">
          <div className={cn(
            "flex items-center gap-1 text-sm",
            isOverdue ? "text-red-600" : "text-gray-500"
          )}>
            <Calendar className="h-3 w-3" />
            <span>
              {formatDistance(new Date(issue.dueDate), new Date(), { addSuffix: true })}
            </span>
          </div>
        </div>
      )}

      {/* Comments count */}
      {issue._count.comments > 0 && (
        <div className="flex-shrink-0">
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <MessageSquare className="h-3 w-3" />
            <span>{issue._count.comments}</span>
          </div>
        </div>
      )}

      {/* Assignee */}
      <div className="flex-shrink-0">
        {issue.assignee ? (
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-xs">
                {(issue.assignee.name || issue.assignee.email).charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-gray-600 hidden md:block">
              {issue.assignee.name || issue.assignee.email}
            </span>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleAssigneeChange}
            className="text-gray-400 hover:text-gray-600"
          >
            <User className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Created date */}
      <div className="flex-shrink-0 text-sm text-gray-500 hidden lg:block">
        {formatDistance(new Date(issue.createdAt), new Date(), { addSuffix: true })}
      </div>

      {/* Actions */}
      <div className="flex-shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-6 w-6 p-0 transition-opacity",
                isHovered ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              )}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleEdit}>
              Edit issue
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleAssigneeChange}>
              Change assignee
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleStatusChange}>
              Change status
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={handleDelete}
              className="text-red-600 hover:text-red-700"
            >
              Delete issue
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
} 