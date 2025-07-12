// Workspace-scoped Settings Layout - Linear Clone
"use client";

import { usePathname, useParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft,
  Building2, 
  Users, 
  UserPlus, 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Tag, 
  GitBranch,
  Palette,
  FileType,
  FolderOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SettingsSection {
  title: string;
  items: {
    icon: React.ElementType;
    label: string;
    href: string;
    description?: string;
  }[];
}

interface SettingsLayoutProps {
  children: React.ReactNode;
}

export default function WorkspaceSettingsLayout({ children }: SettingsLayoutProps) {
  const pathname = usePathname();
  const params = useParams();
  const workspaceUrl = params?.workspaceUrl as string;
  const router = useRouter();

  // Prefetch commonly accessed settings pages for instant navigation
  useEffect(() => {
    if (workspaceUrl) {
      const pagesToPrefetch = [
        `/workspaces/${workspaceUrl}/settings/workspace`,
        `/workspaces/${workspaceUrl}/settings/projects`,
        `/workspaces/${workspaceUrl}/settings/teams`,
        `/workspaces/${workspaceUrl}/settings/members`,
        `/workspaces/${workspaceUrl}/settings/issue-types`,
        `/workspaces/${workspaceUrl}/settings/status-flows`,
        `/workspaces/${workspaceUrl}/settings/issue-fields`,
        `/workspaces/${workspaceUrl}/settings/labels`
      ];

      // Prefetch pages with a small delay to avoid blocking initial render
      const prefetchTimeout = setTimeout(() => {
        pagesToPrefetch.forEach(route => {
          router.prefetch(route);
        });
      }, 100);

      return () => clearTimeout(prefetchTimeout);
    }
  }, [workspaceUrl, router]);

  // Create workspace-scoped settings sections
  const settingsSections: SettingsSection[] = [
    {
      title: 'Administration',
      items: [
        {
          icon: Building2,
          label: 'Workspace',
          href: `/workspaces/${workspaceUrl}/settings/workspace`,
          description: 'Manage workspace settings and branding'
        },
        {
          icon: FolderOpen,
          label: 'Projects',
          href: `/workspaces/${workspaceUrl}/settings/projects`,
          description: 'Create and manage projects'
        },
        {
          icon: Users,
          label: 'Teams',
          href: `/workspaces/${workspaceUrl}/settings/teams`,
          description: 'Create and manage teams'
        },
        {
          icon: UserPlus,
          label: 'Members',
          href: `/workspaces/${workspaceUrl}/settings/members`,
          description: 'Invite and manage team members'
        },
      ]
    },
    {
      title: 'Configuration',
      items: [
        {
          icon: FileType,
          label: 'Issue Types',
          href: `/workspaces/${workspaceUrl}/settings/issue-types`,
          description: 'Define different types of issues (Bug, Feature, Task, etc.)'
        },
        {
          icon: GitBranch,
          label: 'Status Flows',
          href: `/workspaces/${workspaceUrl}/settings/status-flows`,
          description: 'Configure status flows and workflow transitions'
        },
        {
          icon: Tag,
          label: 'Labels',
          href: `/workspaces/${workspaceUrl}/settings/labels`,
          description: 'Manage issue labels and categories'
        },
        {
          icon: Settings,
          label: 'Issue Fields',
          href: `/workspaces/${workspaceUrl}/settings/issue-fields`,
          description: 'Configure field sets for issues'
        },
      ]
    },
    {
      title: 'Preferences',
      items: [
        {
          icon: User,
          label: 'Profile',
          href: `/workspaces/${workspaceUrl}/settings/profile`,
          description: 'Manage your profile and account'
        },
        {
          icon: Bell,
          label: 'Notifications',
          href: `/workspaces/${workspaceUrl}/settings/notifications`,
          description: 'Configure notification preferences'
        },
        {
          icon: Shield,
          label: 'Security & access',
          href: `/workspaces/${workspaceUrl}/settings/security`,
          description: 'Manage security and access settings'
        },
      ]
    }
  ];

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 overflow-y-auto">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <Link href={`/workspaces/${workspaceUrl}`}>
              <Button variant="ghost" size="sm" className="p-2">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <h1 className="text-lg font-semibold text-slate-900 dark:text-white">
              Settings
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Workspace: {workspaceUrl}
          </p>
        </div>

        {/* Navigation */}
        <div className="p-2">
          <div className="space-y-6">
            {settingsSections.map((section) => (
              <div key={section.title}>
                <h3 className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 px-2">
                  {section.title}
                </h3>
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-800",
                          isActive 
                            ? "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border-r-2 border-orange-500" 
                            : "text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
                        )}
                      >
                        <Icon className={cn(
                          "w-4 h-4 flex-shrink-0",
                          isActive ? "text-orange-500" : "text-slate-500 dark:text-slate-400"
                        )} />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{item.label}</div>
                          {item.description && (
                            <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                              {item.description}
                            </div>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
} 