// User Avatar Component - 
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { formatInitials } from '@/lib/formatters';

interface UserAvatarProps {
  name: string;
  imageUrl?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'h-6 w-6 text-xs',
  md: 'h-8 w-8 text-sm',
  lg: 'h-10 w-10 text-base',
};

export function UserAvatar({ 
  name, 
  imageUrl, 
  size = 'md', 
  className 
}: UserAvatarProps) {
  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      <AvatarImage src={imageUrl} alt={name} />
      <AvatarFallback className="bg-orange text-orange-foreground font-medium">
        {formatInitials(name)}
      </AvatarFallback>
    </Avatar>
  );
} 