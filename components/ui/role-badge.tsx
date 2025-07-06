import { Badge } from './badge';

interface RoleBadgeProps {
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
}

export function RoleBadge({ role }: RoleBadgeProps) {
  const variant = role === 'OWNER' ? 'destructive' : 
                  role === 'ADMIN' ? 'default' : 'secondary';
  
  return (
    <Badge variant={variant}>
      {role}
    </Badge>
  );
} 