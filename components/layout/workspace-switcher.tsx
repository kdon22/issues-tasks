"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  ChevronDown, 
  Settings, 
  Plus, 
  Check,
  Building2,
  Users,
  CreditCard,
  Globe,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useUserInstances, useUserWorkspaces } from '@/lib/hooks';
import { useCurrentWorkspace } from '@/lib/hooks/use-current-workspace';

interface Workspace {
  id: string;
  name: string;
  url: string;
  avatarType: string;
  avatarColor?: string;
  avatarEmoji?: string;
  avatarIcon?: string;
  avatarImageUrl?: string;
  role: string;
  lastAccessed: Date;
}

interface Instance {
  id: string;
  name: string;
  slug: string;
  domain: string;
  status: string;
  lastAccessed: Date;
}

export function WorkspaceSwitcher() {
  const params = useParams();
  const workspaceUrl = params.workspaceUrl as string;
  
  // Fetch current workspace details
  const { workspace: currentWorkspace, isLoading: currentWorkspaceLoading } = useCurrentWorkspace();
  
  // Multi-tenant SaaS architecture - properly restored! 🏗️
  const { data: instances = [], isLoading: instancesLoading } = useUserInstances();
  const { data: workspaces = [], isLoading: workspacesLoading } = useUserWorkspaces();

  const handleWorkspaceChange = (workspace: Workspace) => {
    // Navigate to the new workspace
          window.location.href = `/workspaces/${workspace.url}`;
  };

  const handleInstanceSwitch = (instance: Instance) => {
    // Switch to different instance
    if (instance.domain !== window.location.host) {
      window.location.href = `https://${instance.domain}`;
    }
  };

  // Build workspace-aware URLs
  const getWorkspaceUrl = (path: string) => {
    if (workspaceUrl) {
      return `/workspaces/${workspaceUrl}${path}`;
    }
    return path; // Fallback to old URLs if no workspace context
  };

  // Default workspace display if no data yet
  const displayWorkspace = currentWorkspace || {
    name: 'Loading...',
    role: 'MEMBER',
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-8 px-3 text-left font-medium hover:bg-slate-100 dark:hover:bg-slate-800 focus:bg-slate-100 dark:focus:bg-slate-800"
          disabled={currentWorkspaceLoading}
        >
          <div className="flex items-center gap-2 min-w-0">
            {/* Workspace Avatar */}
            <div 
              className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
              style={{ 
                backgroundColor: currentWorkspace?.avatarColor || '#F97316',
                background: `linear-gradient(135deg, ${currentWorkspace?.avatarColor || '#F97316'}, ${currentWorkspace?.avatarColor || '#F97316'}dd)`
              }}
            >
              <Building2 className="w-3 h-3 text-white" />
            </div>
            
            {/* Workspace Name */}
            <span className="truncate text-sm font-medium text-slate-900 dark:text-white">
              {displayWorkspace.name}
            </span>
            
            {/* Chevron */}
            <ChevronDown className="w-4 h-4 text-slate-500 dark:text-slate-400 flex-shrink-0" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="start" 
        className="w-80 p-1"
        sideOffset={8}
      >
        {/* Current Workspace Header */}
        <DropdownMenuLabel className="p-3 pb-2">
          <div className="flex items-center gap-2">
            <div 
              className="w-6 h-6 rounded flex items-center justify-center"
              style={{ 
                backgroundColor: currentWorkspace?.avatarColor || '#F97316',
                background: `linear-gradient(135deg, ${currentWorkspace?.avatarColor || '#F97316'}, ${currentWorkspace?.avatarColor || '#F97316'}dd)`
              }}
            >
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <div className="font-medium text-slate-900 dark:text-white truncate">
                {displayWorkspace.name}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                {displayWorkspace.role} role
              </div>
            </div>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        {/* Workspace Management */}
        <div className="p-1">
          <Link href={getWorkspaceUrl("/settings/workspace")}>
            <DropdownMenuItem className="cursor-pointer p-3 focus:bg-slate-50 dark:focus:bg-slate-800">
              <Settings className="w-4 h-4 mr-3 text-slate-500 dark:text-slate-400" />
              <div className="flex-1">
                <div className="font-medium text-slate-900 dark:text-white">
                  Settings
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Manage workspace and preferences
                </div>
              </div>
            </DropdownMenuItem>
          </Link>
          
          <Link href={getWorkspaceUrl("/settings/members")}>
            <DropdownMenuItem className="cursor-pointer p-3 focus:bg-slate-50 dark:focus:bg-slate-800">
              <Users className="w-4 h-4 mr-3 text-slate-500 dark:text-slate-400" />
              <div className="flex-1">
                <div className="font-medium text-slate-900 dark:text-white">
                  Members
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Invite and manage team members
                </div>
              </div>
            </DropdownMenuItem>
          </Link>
          
          <Link href={getWorkspaceUrl("/settings/billing")}>
            <DropdownMenuItem className="cursor-pointer p-3 focus:bg-slate-50 dark:focus:bg-slate-800">
              <CreditCard className="w-4 h-4 mr-3 text-slate-500 dark:text-slate-400" />
              <div className="flex-1">
                <div className="font-medium text-slate-900 dark:text-white">
                  Billing
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Manage subscription and billing
                </div>
              </div>
            </DropdownMenuItem>
          </Link>
        </div>
        
        <DropdownMenuSeparator />
        
        {/* Switch Workspace */}
        {workspaces.length > 0 && (
          <>
            <DropdownMenuLabel className="p-3 pb-2">
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Switch Workspace
              </div>
            </DropdownMenuLabel>
            
            <div className="p-1 max-h-32 overflow-y-auto">
              {workspaces.map((workspace: Workspace) => (
                <DropdownMenuItem
                  key={workspace.id}
                  className="cursor-pointer p-3 focus:bg-slate-50 dark:focus:bg-slate-800"
                  onClick={() => handleWorkspaceChange(workspace)}
                >
                  <div className="flex items-center gap-2 w-full">
                    <div className="w-5 h-5 bg-gradient-to-br from-orange-500 to-orange-600 rounded flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-3 h-3 text-white" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-slate-900 dark:text-white truncate">
                        {workspace.name}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                        {workspace.role} role
                      </div>
                    </div>
                    
                    {workspace.url === workspaceUrl && (
                      <Check className="w-4 h-4 text-orange-500 flex-shrink-0" />
                    )}
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
            
            <DropdownMenuSeparator />
          </>
        )}
        
        {/* Switch Instance - Multi-tenant SaaS Architecture 🏗️ */}
        {instances.length > 0 && (
          <>
            <DropdownMenuLabel className="p-3 pb-2">
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Switch Instance
              </div>
            </DropdownMenuLabel>
            
            <div className="p-1 max-h-32 overflow-y-auto">
              {instances.map((instance: Instance) => (
                <DropdownMenuItem
                  key={instance.id}
                  className="cursor-pointer p-3 focus:bg-slate-50 dark:focus:bg-slate-800"
                  onClick={() => handleInstanceSwitch(instance)}
                >
                  <div className="flex items-center gap-2 w-full">
                    <Globe className="w-4 h-4 text-slate-500 dark:text-slate-400 flex-shrink-0" />
                    
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-slate-900 dark:text-white truncate">
                        {instance.name}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {instance.domain}
                      </div>
                    </div>
                    
                    <ArrowRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
            
            <DropdownMenuSeparator />
          </>
        )}
        
        {/* Create Workspace */}
        <div className="p-1">
          <Link href="/workspaces/create">
            <DropdownMenuItem className="cursor-pointer p-3 focus:bg-slate-50 dark:focus:bg-slate-800">
              <Plus className="w-4 h-4 mr-3 text-slate-500 dark:text-slate-400" />
              <div className="flex-1">
                <div className="font-medium text-slate-900 dark:text-white">
                  Create workspace
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Start a new workspace
                </div>
              </div>
            </DropdownMenuItem>
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 