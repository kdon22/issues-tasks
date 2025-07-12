// Route Prefetching System - Simplified (Legacy system removed)
import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useRef, useCallback } from 'react';
import { useCurrentWorkspace } from '@/lib/hooks/use-current-workspace';
import { createActionClient } from '@/lib/api/action-client';

interface PrefetchOptions {
  priority?: 'high' | 'medium' | 'low';
  force?: boolean;
  timeout?: number;
}

// Global prefetch cache to prevent duplicate requests
const prefetchCache = new Map<string, Promise<any>>();

export class RoutePrefetcher {
  private prefetchQueue = new Set<string>();
  private prefetchCache = new Map<string, number>();
  private actionClient: any = null;
  private workspaceUrl: string | null = null;

  constructor() {
    // Initialize prefetcher
  }

  setWorkspace(workspaceUrl: string) {
    this.workspaceUrl = workspaceUrl;
    this.actionClient = createActionClient(workspaceUrl);
  }

  // Smart prefetch based on route patterns
  async prefetchRoute(
    route: string,
    params: Record<string, string> = {},
    options: PrefetchOptions = {}
  ): Promise<void> {
    const { priority = 'medium', force = false, timeout = 5000 } = options;
    
    if (!this.actionClient || !this.workspaceUrl) {
      console.warn('🚨 Route prefetcher not initialized with workspace');
      return;
    }

    const cacheKey = `${route}:${JSON.stringify(params)}`;
    
    // Check if already prefetched recently
    if (!force && this.prefetchCache.has(cacheKey)) {
      const lastPrefetch = this.prefetchCache.get(cacheKey)!;
      if (Date.now() - lastPrefetch < 60000) { // 1 minute cache
        console.log('🎯 Route already prefetched:', route);
        return;
      }
    }

    // Check if already in queue
    if (this.prefetchQueue.has(cacheKey)) {
      return;
    }

    this.prefetchQueue.add(cacheKey);

    try {
      console.log('🚀 Prefetching route:', route, 'with priority:', priority);
      
      // Route-specific prefetch strategies
      if (route.includes('/issues/')) {
        await this.prefetchIssueDetail(params.issueId);
      } else if (route.includes('/projects/')) {
        await this.prefetchProjectDetail(params.projectId);
      } else if (route.includes('/settings/')) {
        await this.prefetchSettingsData(route);
      } else if (route.includes('/issues')) {
        await this.prefetchIssuesList();
      } else if (route.includes('/projects')) {
        await this.prefetchProjectsList();
      }

      this.prefetchCache.set(cacheKey, Date.now());
      console.log('✅ Route prefetched successfully:', route);
      
    } catch (error) {
      console.warn('⚠️ Prefetch failed:', route, error);
    } finally {
      this.prefetchQueue.delete(cacheKey);
    }
  }

  // Prefetch issue detail and related data
  private async prefetchIssueDetail(issueId: string) {
    if (!issueId) return;
    
    const prefetchKey = `issue-detail-${issueId}`;
    if (prefetchCache.has(prefetchKey)) return;
    
    const prefetchPromise = Promise.all([
      this.actionClient.executeAction({ action: 'issue.get', resourceId: issueId }),
      this.actionClient.executeAction({ action: 'comment.list', parentId: issueId }),
      this.actionClient.executeAction({ action: 'team.list' }),
      this.actionClient.executeAction({ action: 'state.list' }),
      this.actionClient.executeAction({ action: 'member.list' }),
    ]);
    
    prefetchCache.set(prefetchKey, prefetchPromise);
    await prefetchPromise;
  }

  // Prefetch project detail and related data
  private async prefetchProjectDetail(projectId: string) {
    if (!projectId) return;
    
    const prefetchKey = `project-detail-${projectId}`;
    if (prefetchCache.has(prefetchKey)) return;
    
    const prefetchPromise = Promise.all([
      this.actionClient.executeAction({ action: 'project.get', resourceId: projectId }),
      this.actionClient.executeAction({ action: 'issue.list' }),
      this.actionClient.executeAction({ action: 'member.list' }),
    ]);
    
    prefetchCache.set(prefetchKey, prefetchPromise);
    await prefetchPromise;
  }

  // Prefetch settings data based on route
  private async prefetchSettingsData(route: string) {
    const prefetchKey = `settings-${route}`;
    if (prefetchCache.has(prefetchKey)) return;
    
    let prefetchPromise: Promise<any>;
    
    if (route.includes('/teams')) {
      prefetchPromise = this.actionClient.executeAction({ action: 'team.list' });
    } else if (route.includes('/projects')) {
      prefetchPromise = this.actionClient.executeAction({ action: 'project.list' });
    } else if (route.includes('/members')) {
      prefetchPromise = this.actionClient.executeAction({ action: 'member.list' });
    } else if (route.includes('/labels')) {
      prefetchPromise = this.actionClient.executeAction({ action: 'label.list' });
    } else if (route.includes('/issue-types')) {
      prefetchPromise = this.actionClient.executeAction({ action: 'issueType.list' });
    } else if (route.includes('/statuses')) {
      prefetchPromise = this.actionClient.executeAction({ action: 'state.list' });
    } else {
      // Generic settings prefetch
      prefetchPromise = Promise.all([
        this.actionClient.executeAction({ action: 'team.list' }),
        this.actionClient.executeAction({ action: 'project.list' }),
        this.actionClient.executeAction({ action: 'member.list' }),
      ]);
    }
    
    prefetchCache.set(prefetchKey, prefetchPromise);
    await prefetchPromise;
  }

  // Prefetch issues list
  private async prefetchIssuesList() {
    const prefetchKey = 'issues-list';
    if (prefetchCache.has(prefetchKey)) return;
    
    const prefetchPromise = Promise.all([
      this.actionClient.executeAction({ action: 'issue.list' }),
      this.actionClient.executeAction({ action: 'team.list' }),
      this.actionClient.executeAction({ action: 'project.list' }),
      this.actionClient.executeAction({ action: 'member.list' }),
      this.actionClient.executeAction({ action: 'issueType.list' }),
    ]);
    
    prefetchCache.set(prefetchKey, prefetchPromise);
    await prefetchPromise;
  }

  // Prefetch projects list
  private async prefetchProjectsList() {
    const prefetchKey = 'projects-list';
    if (prefetchCache.has(prefetchKey)) return;
    
    const prefetchPromise = Promise.all([
      this.actionClient.executeAction({ action: 'project.list' }),
      this.actionClient.executeAction({ action: 'team.list' }),
      this.actionClient.executeAction({ action: 'member.list' }),
    ]);
    
    prefetchCache.set(prefetchKey, prefetchPromise);
    await prefetchPromise;
  }

  cleanup(): void {
    this.prefetchQueue.clear();
    this.prefetchCache.clear();
  }
}

// Singleton instance
export const routePrefetcher = new RoutePrefetcher();

// React hooks for prefetching
export function useRoutePrefetching() {
  const router = useRouter();
  const pathname = usePathname();
  const { workspace } = useCurrentWorkspace();

  useEffect(() => {
    if (workspace?.url) {
      routePrefetcher.setWorkspace(workspace.url);
    }
  }, [workspace?.url]);

  const prefetchRoute = useCallback(
    (route: string, options?: PrefetchOptions) => {
      if (workspace?.url) {
        // Extract parameters from route
        const params: Record<string, string> = { workspaceUrl: workspace.url };
        
        // Extract dynamic parameters
        const issueMatch = route.match(/\/issues\/([^\/]+)/);
        if (issueMatch) {
          params.issueId = issueMatch[1];
        }
        
        const projectMatch = route.match(/\/projects\/([^\/]+)/);
        if (projectMatch) {
          params.projectId = projectMatch[1];
        }
        
        return routePrefetcher.prefetchRoute(route, params, options);
      }
    },
    [workspace?.url]
  );

  return {
    prefetchRoute,
    isLoading: false // Simplified - no loading state
  };
}

// Enhanced prefetch link component
export function PrefetchLink({ 
  href, 
  children, 
  className, 
  prefetch = true,
  priority = 'medium',
  onMouseEnter,
  onMouseLeave,
  ...props 
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  prefetch?: boolean;
  priority?: 'high' | 'medium' | 'low';
  onMouseEnter?: React.MouseEventHandler<HTMLAnchorElement>;
  onMouseLeave?: React.MouseEventHandler<HTMLAnchorElement>;
} & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  const { prefetchRoute } = useRoutePrefetching();
  const prefetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const handleMouseEnter = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    if (prefetch && prefetchRoute) {
      // Add slight delay to avoid prefetching on accidental hovers
      prefetchTimeoutRef.current = setTimeout(() => {
        prefetchRoute(href, { priority });
      }, 100);
    }
    onMouseEnter?.(e);
  }, [href, prefetch, priority, prefetchRoute, onMouseEnter]);

  const handleMouseLeave = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    if (prefetchTimeoutRef.current) {
      clearTimeout(prefetchTimeoutRef.current);
      prefetchTimeoutRef.current = null;
    }
    onMouseLeave?.(e);
  }, [onMouseLeave]);

  return (
    <a
      href={href}
      className={className}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {children}
    </a>
  );
}

// Hook for prefetching common routes on mount
export function usePrefetchOnMount(routes: string[], priority: 'high' | 'medium' | 'low' = 'medium') {
  const { prefetchRoute } = useRoutePrefetching();
  
  useEffect(() => {
    if (prefetchRoute) {
      // Add slight delay to not interfere with initial page load
      const timeout = setTimeout(() => {
        routes.forEach(route => {
          prefetchRoute(route, { priority });
        });
      }, 1000);
      
      return () => clearTimeout(timeout);
    }
  }, [routes, priority, prefetchRoute]);
}

// Hook for prefetching based on user navigation patterns
export function useIntelligentPrefetch() {
  const { prefetchRoute } = useRoutePrefetching();
  const pathname = usePathname();
  
  useEffect(() => {
    if (!prefetchRoute) return;
    
    // Intelligent prefetch based on current route
    const intelligentPrefetch = () => {
      if (pathname.includes('/issues/')) {
        // On issue detail, prefetch issues list and related issues
        prefetchRoute('/issues', { priority: 'low' });
      } else if (pathname.includes('/issues')) {
        // On issues list, prefetch common issue details (first few issues)
        // This would be implemented based on actual issue IDs
      } else if (pathname.includes('/projects/')) {
        // On project detail, prefetch projects list and issue list
        prefetchRoute('/projects', { priority: 'low' });
        prefetchRoute('/issues', { priority: 'low' });
      } else if (pathname.includes('/settings/')) {
        // On settings, prefetch other common settings pages
        const commonSettings = [
          '/settings/teams',
          '/settings/projects',
          '/settings/members',
          '/settings/labels',
        ];
        commonSettings.forEach(route => {
          if (!pathname.includes(route)) {
            prefetchRoute(route, { priority: 'low' });
          }
        });
      }
    };
    
    // Add delay to not interfere with current page load
    const timeout = setTimeout(intelligentPrefetch, 2000);
    return () => clearTimeout(timeout);
  }, [pathname, prefetchRoute]);
} 