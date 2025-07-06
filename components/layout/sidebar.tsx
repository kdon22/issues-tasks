"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { 
  Home, 
  CircleDot, 
  FolderOpen, 
  Users, 
  Settings, 
  Search,
  Plus,
  ChevronDown,
  Target,
  Calendar,
  BarChart3,
  Building2,
  Tag,
  FileType,
  GitBranch,
  TestTube
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { WorkspaceSwitcher } from './workspace-switcher';
import { CommandPalette } from './command-palette';
import { NewIssueDialog } from '@/components/issues/new-issue-dialog';
import { useKeyboardShortcuts } from '@/lib/hooks/use-keyboard-shortcuts';

interface SidebarItem {
  icon: React.ElementType;
  label: string;
  href: string;
  count?: number;
  isActive?: boolean;
}

interface SidebarSection {
  title: string;
  items: SidebarItem[];
}

export function Sidebar() {
  const pathname = usePathname();
  const params = useParams();
  const workspaceUrl = params.workspaceUrl as string;
  
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [newIssueOpen, setNewIssueOpen] = useState(false);
  const [testModalOpen, setTestModalOpen] = useState(false);

  // Global keyboard shortcuts
  useKeyboardShortcuts({
    onCommandPalette: () => setCommandPaletteOpen(true),
    onNewIssue: () => setNewIssueOpen(true)
  });

  // Build workspace-aware URLs
  const getWorkspaceUrl = (path: string) => {
    if (workspaceUrl) {
      return `/workspace/${workspaceUrl}${path}`;
    }
    return path; // Fallback to old URLs if no workspace context
  };

  const sections: SidebarSection[] = [
    {
      title: 'Main',
      items: [
        {
          icon: Home,
          label: 'Dashboard',
          href: getWorkspaceUrl('/'),
        },
        {
          icon: CircleDot,
          label: 'Issues',
          href: getWorkspaceUrl('/issues'),
          count: 12,
        },
        {
          icon: FolderOpen,
          label: 'Projects',
          href: getWorkspaceUrl('/projects'),
          count: 3,
        },
        {
          icon: Target,
          label: 'Goals',
          href: getWorkspaceUrl('/goals'),
        },
        {
          icon: Calendar,
          label: 'Roadmap',
          href: getWorkspaceUrl('/roadmap'),
        },
        {
          icon: BarChart3,
          label: 'Analytics',
          href: getWorkspaceUrl('/analytics'),
        },
      ],
    },
    {
      title: 'Workspace',
      items: [
        {
          icon: Users,
          label: 'Teams',
          href: getWorkspaceUrl('/settings/teams'),
          count: 5,
        },
      ],
    },
    {
      title: 'Configuration',
      items: [
        {
          icon: FileType,
          label: 'Issue Types',
          href: getWorkspaceUrl('/settings/issue-types'),
        },
        {
          icon: GitBranch,
          label: 'Issue Statuses',
          href: getWorkspaceUrl('/settings/statuses'),
        },
        {
          icon: Tag,
          label: 'Labels',
          href: getWorkspaceUrl('/settings/labels'),
        },
        {
          icon: Settings,
          label: 'Custom Fields',
          href: getWorkspaceUrl('/settings/custom-fields'),
        },
      ],
    },
  ];

  return (
    <>
      <div className="flex flex-col h-full bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 border-r border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="p-3 border-b border-slate-200 dark:border-slate-800 space-y-3">
          {/* Workspace Switcher */}
          <WorkspaceSwitcher />
          
          {/* Search Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCommandPaletteOpen(true)}
            className="w-full justify-start h-8 px-3 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Search className="w-4 h-4 mr-2" />
            <span className="flex-1 text-left">Search</span>
            <kbd className="pointer-events-none h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              ⌘K
            </kbd>
          </Button>
          
          {/* New Issue Button */}
          <Button
            size="sm"
            onClick={() => setNewIssueOpen(true)}
            className="w-full h-8 bg-orange-500 hover:bg-orange-600 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Issue
          </Button>

        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-2 space-y-1">
            {sections.map((section) => (
              <div key={section.title}>
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider px-3 py-2">
                  {section.title}
                </div>
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                          isActive
                            ? "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400"
                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
                        )}
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        <span className="flex-1">{item.label}</span>
                        {item.count && (
                          <span className="text-xs bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded-full">
                            {item.count}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Command Palette */}
      <CommandPalette
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
        onNewIssue={() => setNewIssueOpen(true)}
      />

      {/* New Issue Dialog */}
      <NewIssueDialog
        open={newIssueOpen}
        onOpenChange={setNewIssueOpen}
      />

    </>
  );
} 