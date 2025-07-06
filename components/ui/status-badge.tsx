import { Badge } from './badge';

interface StatusBadgeProps {
  status: 'ACTIVE' | 'PENDING' | 'DISABLED';
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const variant = status === 'ACTIVE' ? 'success' : 
                  status === 'PENDING' ? 'warning' : 'destructive';
  
  const label = status === 'ACTIVE' ? 'Active' :
                status === 'PENDING' ? 'Invited' : 'Suspended';
  
  return (
    <Badge variant={variant}>
      {label}
    </Badge>
  );
} 