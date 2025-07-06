"use client";

import { formatDistance } from 'date-fns';
import { 
  Activity, 
  User, 
  Edit, 
  UserPlus, 
  Tag, 
  Calendar,
  ArrowRight,
  GitBranch,
  Trash2
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface User {
  id: string;
  name: string | null;
  email: string;
  avatarColor?: string | null;
  avatarType?: string | null;
}

interface ActivityItem {
  id: string;
  type: string;
  data: any;
  createdAt: string;
  user: User;
}

interface IssueActivityProps {
  activities: ActivityItem[];
  issueId: string;
}

export function IssueActivity({ activities, issueId }: IssueActivityProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'issue_created':
        return <GitBranch className="h-4 w-4 text-green-600" />;
      case 'issue_updated':
        return <Edit className="h-4 w-4 text-blue-600" />;
      case 'issue_assigned':
      case 'issue_unassigned':
        return <User className="h-4 w-4 text-purple-600" />;
      case 'issue_labeled':
      case 'issue_unlabeled':
        return <Tag className="h-4 w-4 text-orange-600" />;
      case 'issue_status_changed':
        return <ArrowRight className="h-4 w-4 text-indigo-600" />;
      case 'issue_priority_changed':
        return <Activity className="h-4 w-4 text-red-600" />;
      case 'issue_due_date_changed':
        return <Calendar className="h-4 w-4 text-yellow-600" />;
      case 'issue_deleted':
        return <Trash2 className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatActivityMessage = (activity: ActivityItem) => {
    const { type, data, user } = activity;
    const userName = user.name || user.email;

    switch (type) {
      case 'issue_created':
        return `${userName} created this issue`;
      
      case 'issue_updated':
        return `${userName} updated the issue`;
      
      case 'issue_assigned':
        return data.assignee 
          ? `${userName} assigned this to ${data.assignee.name || data.assignee.email}`
          : `${userName} assigned this issue`;
      
      case 'issue_unassigned':
        return `${userName} unassigned this issue`;
      
      case 'issue_labeled':
        return (
          <span>
            {userName} added label{' '}
            <Badge
              variant="secondary"
              className="text-xs"
              style={{ 
                backgroundColor: `${data.label.color}20`,
                color: data.label.color,
                borderColor: `${data.label.color}40`
              }}
            >
              {data.label.name}
            </Badge>
          </span>
        );
      
      case 'issue_unlabeled':
        return (
          <span>
            {userName} removed label{' '}
            <Badge variant="secondary" className="text-xs">
              {data.label.name}
            </Badge>
          </span>
        );
      
      case 'issue_status_changed':
        return (
          <span>
            {userName} changed status from{' '}
            <span className="font-medium">{data.from}</span> to{' '}
            <span className="font-medium">{data.to}</span>
          </span>
        );
      
      case 'issue_priority_changed':
        return (
          <span>
            {userName} changed priority from{' '}
            <span className="font-medium">{data.from}</span> to{' '}
            <span className="font-medium">{data.to}</span>
          </span>
        );
      
      case 'issue_due_date_changed':
        if (data.to) {
          return `${userName} set due date to ${new Date(data.to).toLocaleDateString()}`;
        } else {
          return `${userName} removed due date`;
        }
      
      case 'issue_comment_added':
        return `${userName} added a comment`;
      
      case 'issue_comment_updated':
        return `${userName} updated a comment`;
      
      case 'issue_comment_deleted':
        return `${userName} deleted a comment`;
      
      case 'issue_deleted':
        return `${userName} deleted this issue`;
      
      default:
        return `${userName} performed an action`;
    }
  };

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Activity className="h-8 w-8 mx-auto mb-2 text-gray-400" />
        <p>No activity yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
        <Activity className="h-4 w-4" />
        Activity
      </div>
      
      <div className="space-y-3">
        {activities.map((activity) => (
          <div key={activity.id} className="flex gap-3">
            <div className="flex-shrink-0 mt-1">
              {getActivityIcon(activity.type)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback 
                      className="text-xs"
                      style={{ backgroundColor: activity.user.avatarColor || '#6B7280' }}
                    >
                      {(activity.user.name || activity.user.email).charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="text-sm text-gray-700">
                    {formatActivityMessage(activity)}
                  </div>
                </div>
                
                <span className="text-xs text-gray-500 flex-shrink-0">
                  {formatDistance(new Date(activity.createdAt), new Date(), { addSuffix: true })}
                </span>
              </div>
              
              {/* Additional activity details */}
              {activity.data.description && (
                <div className="mt-2 text-sm text-gray-600 bg-gray-50 rounded p-2">
                  {activity.data.description}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 