// State Badge Component - Linear Clone
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { STATE_COLORS } from '@/lib/constants';
import { formatStateType } from '@/lib/formatters';

interface StateBadgeProps {
  state: keyof typeof STATE_COLORS;
  className?: string;
}

export function StateBadge({ state, className }: StateBadgeProps) {
  return (
    <Badge 
      variant="secondary" 
      className={cn(
        STATE_COLORS[state],
        'text-xs font-medium',
        className
      )}
    >
      {formatStateType(state)}
    </Badge>
  );
} 