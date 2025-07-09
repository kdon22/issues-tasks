// App Header Component - 
"use client";

import { cn } from '@/lib/utils';

interface AppHeaderProps {
  title?: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export function AppHeader({ 
  title, 
  actions, 
  children, 
  className
}: AppHeaderProps) {
  return (
    <header className={cn(
      'flex items-center justify-between h-14 px-4 border-b border-border bg-background',
      className
    )}>
      <div className="flex items-center gap-4">
        {title && (
          <h1 className="text-lg font-semibold">{title}</h1>
        )}
        {children}
      </div>
      
      <div className="flex items-center gap-2">
        {/* Custom Actions */}
        {actions}
      </div>
    </header>
  );
} 