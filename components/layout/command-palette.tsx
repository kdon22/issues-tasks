// Command Palette Component - Linear Clone
"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  Search, 
  Plus, 
  Target, 
  CircleDot, 
  FolderOpen, 
  Users, 
  Settings, 
  CreditCard,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface CommandItem {
  id: string;
  title: string;
  description?: string;
  icon: React.ElementType;
  action: () => void;
  category: 'actions' | 'navigation' | 'settings' | 'recent';
  keywords?: string[];
}

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNewIssue?: () => void;
}

export function CommandPalette({ open, onOpenChange, onNewIssue }: CommandPaletteProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const params = useParams();
  const workspaceUrl = params.workspaceUrl as string;

  // Build workspace-aware URLs
  const getWorkspaceUrl = (path: string) => {
    if (workspaceUrl) {
      return `/workspace/${workspaceUrl}${path}`;
    }
    return path; // Fallback to old URLs if no workspace context
  };

  // Mock commands - replace with real navigation logic
  const commands: CommandItem[] = [
    {
      id: 'new-issue',
      title: 'New Issue',
      description: 'Create a new issue',
      icon: Plus,
      action: () => {
        onNewIssue?.();
        onOpenChange(false);
      },
      category: 'actions',
      keywords: ['create', 'add', 'new']
    },
    {
      id: 'dashboard',
      title: 'Dashboard',
      description: 'Go to dashboard',
      icon: Target,
      action: () => {
        window.location.href = getWorkspaceUrl('/');
        onOpenChange(false);
      },
      category: 'navigation'
    },
    {
      id: 'issues',
      title: 'Issues',
      description: 'View all issues',
      icon: CircleDot,
      action: () => {
        window.location.href = getWorkspaceUrl('/issues');
        onOpenChange(false);
      },
      category: 'navigation'
    },
    {
      id: 'projects',
      title: 'Projects',
      description: 'View all projects',
      icon: FolderOpen,
      action: () => {
        window.location.href = getWorkspaceUrl('/projects');
        onOpenChange(false);
      },
      category: 'navigation'
    },
    {
      id: 'team',
      title: 'Team',
      description: 'View team members',
      icon: Users,
      action: () => {
        window.location.href = getWorkspaceUrl('/settings/teams');
        onOpenChange(false);
      },
      category: 'navigation'
    },
    {
      id: 'settings',
      title: 'Settings',
      description: 'Workspace settings',
      icon: Settings,
      action: () => {
        window.location.href = getWorkspaceUrl('/settings/workspace');
        onOpenChange(false);
      },
      category: 'settings'
    },
    {
      id: 'members',
      title: 'Members',
      description: 'Manage team members',
      icon: Users,
      action: () => {
        window.location.href = getWorkspaceUrl('/settings/members');
        onOpenChange(false);
      },
      category: 'settings'
    },
    {
      id: 'billing',
      title: 'Billing',
      description: 'Manage subscription',
      icon: CreditCard,
      action: () => {
        window.location.href = getWorkspaceUrl('/settings/billing');
        onOpenChange(false);
      },
      category: 'settings'
    }
  ];

  // Filter commands based on search
  const filteredCommands = commands.filter(command => {
    const query = searchQuery.toLowerCase();
    return (
      command.title.toLowerCase().includes(query) ||
      command.description?.toLowerCase().includes(query) ||
      command.keywords?.some(keyword => keyword.toLowerCase().includes(query))
    );
  });

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredCommands.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : filteredCommands.length - 1
        );
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, filteredCommands, selectedIndex]);

  // Reset when opening/closing
  useEffect(() => {
    if (open) {
      setSearchQuery('');
      setSelectedIndex(0);
    }
  }, [open]);

  // Update selected index when filtering
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  const categoryTitles = {
    actions: 'Actions',
    navigation: 'Navigation',
    settings: 'Settings',
    recent: 'Recent'
  };

  // Group commands by category
  const groupedCommands = filteredCommands.reduce((acc, command) => {
    if (!acc[command.category]) {
      acc[command.category] = [];
    }
    acc[command.category].push(command);
    return acc;
  }, {} as Record<string, CommandItem[]>);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px] p-0 gap-0 bg-white dark:bg-slate-900">
        <DialogTitle className="sr-only">Command Palette</DialogTitle>
        <div className="border-b border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center gap-3">
            <Search className="w-5 h-5 text-slate-400" />
            <Input
              placeholder="Search or type a command..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base h-auto p-0 bg-transparent"
              autoFocus
            />
            <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                ⌘K
              </kbd>
            </div>
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {Object.entries(groupedCommands).map(([category, categoryCommands]) => (
            <div key={category} className="p-2">
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider px-3 py-2">
                {categoryTitles[category as keyof typeof categoryTitles]}
              </div>
              <div className="space-y-1">
                {categoryCommands.map((command, index) => {
                  const globalIndex = filteredCommands.indexOf(command);
                  const isSelected = globalIndex === selectedIndex;
                  const Icon = command.icon;
                  
                  return (
                    <div
                      key={command.id}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 text-sm rounded-md cursor-pointer transition-colors",
                        isSelected 
                          ? "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400" 
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      )}
                      onClick={() => command.action()}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium">{command.title}</div>
                        {command.description && (
                          <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {command.description}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          
          {filteredCommands.length === 0 && (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <div className="text-sm">No commands found</div>
            </div>
          )}
        </div>

        <div className="border-t border-slate-200 dark:border-slate-700 p-3">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                ↑↓
              </kbd>
              <span>Navigate</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                ↵
              </kbd>
              <span>Select</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                esc
              </kbd>
              <span>Close</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 