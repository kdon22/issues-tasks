import React from 'react';
import { SimpleIcon, SimpleIconWithBackground } from '@/components/ui/simple-icon';

export interface IconCellProps {
  value: string | null | undefined;
  withBackground?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

/**
 * Component for rendering icons in table cells and display contexts
 * Handles "iconName:color" format from database
 */
export function IconCell({ value, withBackground = false, size = 'sm', className }: IconCellProps) {
  if (withBackground) {
    return (
      <SimpleIconWithBackground 
        value={value} 
        size={size} 
        className={className}
        fallback={<span className="text-muted-foreground text-xs">No icon</span>}
      />
    );
  }
  
  return (
    <SimpleIcon 
      value={value} 
      size={size} 
      className={className}
      fallback={<span className="text-muted-foreground text-xs">No icon</span>}
    />
  );
} 