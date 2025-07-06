// Page Layout Component - Linear Clone
import { AppHeader } from '@/components/layout/app-header';
import { cn } from '@/lib/utils';

interface PageLayoutProps {
  title?: string;
  actions?: React.ReactNode;
  headerContent?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function PageLayout({ 
  title, 
  actions, 
  headerContent, 
  children, 
  className 
}: PageLayoutProps) {
  return (
    <div className={cn('flex flex-col h-full', className)}>
      <AppHeader 
        title={title} 
        actions={actions}
      >
        {headerContent}
      </AppHeader>
      <div className="flex-1 overflow-auto p-4">
        {children}
      </div>
    </div>
  );
} 