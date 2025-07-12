import React from 'react';
import { parseIconString, cn } from '@/lib/utils';
import { getIconComponent } from '@/components/ui/icon-picker';
import { Hash } from 'lucide-react';

export interface SimpleIconProps {
  value: string | null | undefined;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  fallback?: React.ReactNode;
}

/**
 * Renders an icon from string format "iconName:color" or just "iconName"
 * Used throughout the resource system for displaying icons in tables and forms
 */
export function SimpleIcon({ value, size = 'md', className, fallback }: SimpleIconProps) {
  const parsed = parseIconString(value);
  
  if (!parsed) {
    return fallback || <span className="text-muted-foreground">-</span>;
  }
  
  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4', 
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8'
  };
  
  const IconComponent = getIconComponent(parsed.iconName);
  
  return (
    <IconComponent 
      className={cn(iconSizes[size], className)} 
      style={{ color: parsed.color }} 
    />
  );
}

/**
 * Renders an icon with a circular background container
 */
export function SimpleIconWithBackground({ value, size = 'md', className, fallback }: SimpleIconProps) {
  const parsed = parseIconString(value);
  
  if (!parsed) {
    return fallback || <span className="text-muted-foreground">-</span>;
  }
  
  const containerSizes = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10', 
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };
  
  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6', 
    xl: 'w-8 h-8'
  };
  
  const IconComponent = getIconComponent(parsed.iconName);
  
  return (
    <div className={cn(
      containerSizes[size], 
      "rounded-full flex items-center justify-center bg-gray-100",
      className
    )}>
      <IconComponent 
        className={iconSizes[size]} 
        style={{ color: parsed.color }} 
      />
    </div>
  );
} 