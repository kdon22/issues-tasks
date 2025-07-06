// Priority Badge Component - Linear Clone
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { PRIORITY_COLORS } from '@/lib/constants';
import { formatPriority } from '@/lib/formatters';

interface PriorityBadgeProps {
  priority: keyof typeof PRIORITY_COLORS;
  className?: string;
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  return (
    <Badge 
      variant="secondary" 
      className={cn(
        PRIORITY_COLORS[priority],
        'text-xs font-medium',
        className
      )}
    >
      {formatPriority(priority)}
    </Badge>
  );
} 