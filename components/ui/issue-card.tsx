// Issue Card Component - 
"use client";

import { Card, CardContent } from '@/components/ui/card';
import { PriorityBadge } from '@/components/ui/priority-badge';
import { StateBadge } from '@/components/ui/state-badge';
import { UserAvatar } from '@/components/ui/user-avatar';
import { cn } from '@/lib/utils';
import { formatIssueId, formatRelativeTime } from '@/lib/formatters';

interface IssueCardProps {
  id: string;
  title: string;
  identifier: string;
  priority: 'NO_PRIORITY' | 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  state: 'BACKLOG' | 'UNSTARTED' | 'STARTED' | 'COMPLETED' | 'CANCELED';
  assignee?: {
    name: string;
    imageUrl?: string;
  };
  createdAt: string;
  teamIdentifier: string;
  number: number;
  className?: string;
  onClick?: () => void;
}

export function IssueCard({ 
  id,
  title,
  identifier,
  priority,
  state,
  assignee,
  createdAt,
  teamIdentifier,
  number,
  className,
  onClick
}: IssueCardProps) {
  return (
    <Card 
      className={cn(
        'cursor-pointer transition-colors hover:bg-muted/50',
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-mono text-muted-foreground">
                {formatIssueId(teamIdentifier, number)}
              </span>
              <StateBadge state={state} />
              <PriorityBadge priority={priority} />
            </div>
            <h3 className="font-medium text-sm leading-tight mb-2 overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
              {title}
            </h3>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{formatRelativeTime(createdAt)}</span>
              {assignee && (
                <UserAvatar 
                  name={assignee.name}
                  imageUrl={assignee.imageUrl}
                  size="sm"
                />
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 