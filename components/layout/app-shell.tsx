// App Shell Layout Component - Linear Clone
import { cn } from '@/lib/utils';
import { AppHeader } from './app-header';

interface AppShellProps {
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  showWorkspaceSwitcher?: boolean;
}

export function AppShell({ 
  sidebar, 
  header, 
  children, 
  className,
  showWorkspaceSwitcher = true
}: AppShellProps) {
  return (
    <div className={cn('flex h-screen bg-background', className)}>
      {sidebar && (
        <aside className="w-64 border-r border-border bg-sidebar">
          {sidebar}
        </aside>
      )}
      <main className="flex-1 overflow-hidden flex flex-col">
        {header || (
          <AppHeader 
            showWorkspaceSwitcher={showWorkspaceSwitcher}
          />
        )}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
} 