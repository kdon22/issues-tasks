"use client";

import { useState } from 'react';
import { Issue, State, Label, User, Comment, Attachment } from '@prisma/client';
import { formatDistanceToNow } from 'date-fns';
import { 
  AlertCircle, 
  ArrowUp, 
  ArrowDown, 
  Circle, 
  CheckCircle2, 
  Clock, 
  User as UserIcon,
  MessageSquare,
  Paperclip,
  Calendar,
  MoreHorizontal,
  Edit3,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PriorityBadge } from '@/components/ui/priority-badge';
import { StateBadge } from '@/components/ui/state-badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

type IssueWithRelations = Issue & {
  state: State;
  assignee?: User;
  labels: Array<{ label: Label }>;
  comments: Comment[];
  attachments: Attachment[];
};

interface IssueCardProps {
  issue: IssueWithRelations;
  className?: string;
}

export function IssueCard({ issue, className }: IssueCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  // Enhanced priority colors with gradients
  const priorityConfig = {
    urgent: {
      icon: ArrowUp,
      gradient: 'from-red-500 to-red-600',
      glow: 'shadow-red-500/25'
    },
    high: {
      icon: ArrowUp,
      gradient: 'from-orange-500 to-orange-600',
      glow: 'shadow-orange-500/25'
    },
    medium: {
      icon: ArrowUp,
      gradient: 'from-yellow-500 to-yellow-600',
      glow: 'shadow-yellow-500/25'
    },
    low: {
      icon: ArrowDown,
      gradient: 'from-green-500 to-green-600',
      glow: 'shadow-green-500/25'
    }
  };

  const priority = priorityConfig[issue.priority as keyof typeof priorityConfig];
  const PriorityIcon = priority?.icon || Circle;

  return (
    <div
      className={cn(
        "group relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl p-6 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50",
        isHovered && "ring-2 ring-orange-500/20",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Gradient Border Effect */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-orange-500/10 via-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100" />
      
      {/* Priority Indicator */}
      <div className="absolute left-0 top-6 w-1 h-12 bg-gradient-to-b from-orange-500 to-orange-600 rounded-r-full opacity-60 group-hover:opacity-100" />
      
      {/* Content */}
      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                {issue.identifier}
              </span>
                             <StateBadge state={issue.state.type} />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <PriorityBadge priority={issue.priority} />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="opacity-0 group-hover:opacity-100"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem>
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600 dark:text-red-400">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 cursor-pointer">
          {issue.title}
        </h3>

        {/* Description */}
        {issue.description && (
          <p className="text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
            {issue.description}
          </p>
        )}

        {/* Labels */}
        {issue.labels && issue.labels.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {issue.labels.map((labelItem) => (
              <Badge 
                key={labelItem.label.id} 
                variant="secondary" 
                className="bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 text-slate-700 dark:text-slate-300 border-0"
              >
                {labelItem.label.name}
              </Badge>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Assignee */}
            {issue.assigneeId && (
              <div className="flex items-center space-x-2">
                <Avatar className="w-6 h-6 border-2 border-white dark:border-slate-800 shadow-sm">
                  <AvatarImage src={`/avatars/${issue.assigneeId}.jpg`} />
                  <AvatarFallback className="text-xs bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                    {issue.assigneeId.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  Assigned
                </span>
              </div>
            )}

            {/* Due Date */}
            {issue.dueDate && (
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {formatDistanceToNow(new Date(issue.dueDate), { addSuffix: true })}
                </span>
              </div>
            )}

            {/* Comments Count */}
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {issue.comments.length}
              </span>
            </div>

            {/* Attachments Count */}
            {issue.attachments.length > 0 && (
              <div className="flex items-center space-x-2">
                <Paperclip className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {issue.attachments.length}
                </span>
              </div>
            )}
          </div>

          {/* Updated Time */}
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {formatDistanceToNow(new Date(issue.updatedAt), { addSuffix: true })}
            </span>
          </div>
        </div>
      </div>

      {/* Hover Glow Effect */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-orange-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 pointer-events-none" />
    </div>
  );
} 