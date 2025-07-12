"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { useCurrentWorkspace } from '@/lib/hooks/use-current-workspace';
import { createActionClient } from '@/lib/api/action-client';

interface CacheContextType {
  isInitialized: boolean;
  error: string | null;
}

const CacheContext = createContext<CacheContextType | null>(null);

export function CacheProvider({ children }: { children: ReactNode }) {
  const [cacheSystem, setCacheSystem] = useState<CacheContextType>({
    isInitialized: false,
    error: null
  });
  const { data: session, status } = useSession();
  const { workspace } = useCurrentWorkspace();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Check if we should initialize cache (only for authenticated users on workspace pages)
  const shouldInitializeCache = () => {
    // Don't initialize on server-side
    if (!isClient || typeof window === 'undefined') return false;
    
    // Don't initialize if session is loading
    if (status === 'loading') return false;
    
    // Don't initialize if user is not authenticated
    if (status === 'unauthenticated' || !session?.user) return false;
    
    // Don't initialize on public pages (auth, login, etc.)
    const publicPages = ['/auth/signin', '/auth/signup', '/login', '/register'];
    if (publicPages.some(page => pathname?.startsWith(page))) return false;
    
    // Only initialize if we have a workspace context
    if (!workspace?.url) return false;
    
    return true;
  };

  // 🚀 Enhanced Cache Initialization with Workspace Bootstrap
  useEffect(() => {
    if (!shouldInitializeCache()) return;

    let isActive = true;
    
    const initializeCache = async () => {
      if (!workspace?.url) {
        console.warn('⚠️ No workspace URL available for cache initialization');
        return;
      }
      
      console.log('🚀 Initializing cache system for workspace:', workspace.url);
      
      try {
        setCacheSystem(prev => ({ ...prev, isInitialized: false, error: null }));
        
        // Create action client for this workspace
        const actionClient = createActionClient(workspace.url);
        
        // Check if we have recent bootstrap data
        const hasRecentData = await actionClient.hasRecentBootstrap(5 * 60 * 1000); // 5 minutes
        
        if (!hasRecentData) {
          console.log('🔄 No recent bootstrap data found, bootstrapping workspace...');
          const startTime = Date.now();
          
          // Bootstrap the entire workspace
          const bootstrapResult = await actionClient.bootstrapWorkspace();
          
          if (bootstrapResult.success) {
            const bootstrapTime = Date.now() - startTime;
            console.log(`✅ Workspace bootstrap completed in ${bootstrapTime}ms`);
            console.log(`📊 Bootstrap data:`, bootstrapResult.data);
          } else {
            console.warn('⚠️ Bootstrap failed:', bootstrapResult.error);
          }
        } else {
          console.log('✅ Recent bootstrap data found, using cached data');
        }
        
        // Mark cache as initialized
        if (isActive) {
          setCacheSystem({
            isInitialized: true,
            error: null
          });
          
          console.log('🎯 Cache system initialized and ready for instant navigation');
        }
        
      } catch (error: any) {
        console.error('💥 Cache initialization failed:', error);
        if (isActive) {
          setCacheSystem({
            isInitialized: false,
            error: error.message || 'Failed to initialize cache'
          });
        }
      }
    };

    initializeCache();
    
    return () => {
      isActive = false;
    };
  }, [workspace?.url, session?.user?.id, pathname, status]);

  return (
    <CacheContext.Provider value={cacheSystem}>
      {children}
    </CacheContext.Provider>
  );
}

export function useCacheSystem() {
  const context = useContext(CacheContext);
  if (!context) {
    throw new Error('useCacheSystem must be used within a CacheProvider');
  }
  return context;
} 