// Route Prefetching System - Simplified (Legacy system removed)
import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useCallback, useRef } from 'react';
import { useCurrentWorkspace } from '../hooks/use-current-workspace';

export interface PrefetchOptions {
  priority?: 'high' | 'medium' | 'low';
  force?: boolean;
  timeout?: number;
}

export class RoutePrefetcher {
  private prefetchQueue = new Set<string>();
  private prefetchCache = new Map<string, number>();
  private workspaceId: string | null = null;

  constructor() {
    // Simplified constructor
  }

  setWorkspace(workspaceId: string) {
    this.workspaceId = workspaceId;
  }

  // Prefetch data for a specific route (simplified)
  async prefetchRoute(
    route: string,
    params: Record<string, string> = {},
    options: PrefetchOptions = {}
  ): Promise<void> {
    const { priority = 'medium', force = false, timeout = 5000 } = options;
    
    const cacheKey = `${route}:${JSON.stringify(params)}`;
    
    // Check if already prefetched recently
    if (!force && this.prefetchCache.has(cacheKey)) {
      const lastPrefetch = this.prefetchCache.get(cacheKey)!;
      if (Date.now() - lastPrefetch < 60000) { // 1 minute cache
        return;
      }
    }

    // Check if already in queue
    if (this.prefetchQueue.has(cacheKey)) {
      return;
    }

    this.prefetchQueue.add(cacheKey);

    try {
      // Simplified prefetch - just cache the fact that we "prefetched"
      await new Promise(resolve => setTimeout(resolve, 10));
      this.prefetchCache.set(cacheKey, Date.now());
    } catch (error) {
      console.warn('Prefetch failed:', route, error);
    } finally {
      this.prefetchQueue.delete(cacheKey);
    }
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
        return routePrefetcher.prefetchRoute(route, { workspaceUrl: workspace.url }, options);
      }
    },
    [workspace?.url]
  );

  return {
    prefetchRoute,
    isLoading: false // Simplified - no loading state
  };
}

export function PrefetchLink({ 
  href, 
  children, 
  className, 
  prefetch = true,
  priority = 'medium',
  ...props 
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  prefetch?: boolean;
  priority?: 'high' | 'medium' | 'low';
} & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  const { prefetchRoute } = useRoutePrefetching();
  
  const handleMouseEnter = useCallback(() => {
    if (prefetch) {
      prefetchRoute?.(href, { priority });
    }
  }, [href, prefetch, priority, prefetchRoute]);

  return (
    <a
      href={href}
      className={className}
      onMouseEnter={handleMouseEnter}
      {...props}
    >
      {children}
    </a>
  );
}

export function usePrefetchOnMount(routes: string[], priority: 'high' | 'medium' | 'low' = 'medium') {
  const { prefetchRoute } = useRoutePrefetching();
  
  useEffect(() => {
    if (prefetchRoute) {
      routes.forEach(route => {
        prefetchRoute(route, { priority });
      });
    }
  }, [routes, priority, prefetchRoute]);
}

export function usePrefetchRelated() {
  const { prefetchRoute } = useRoutePrefetching();
  
  return useCallback((relatedRoutes: string[]) => {
    if (prefetchRoute) {
      relatedRoutes.forEach(route => {
        prefetchRoute(route, { priority: 'low' });
      });
    }
  }, [prefetchRoute]);
} 