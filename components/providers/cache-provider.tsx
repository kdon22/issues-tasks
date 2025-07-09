"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { useCurrentWorkspace } from '@/lib/hooks/use-current-workspace';

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

  useEffect(() => {
    // Reset cache system if we shouldn't initialize
    if (!shouldInitializeCache()) {
      setCacheSystem({
        isInitialized: false,
        error: null
      });
      return;
    }

    // Simple initialization for action-based system
    const initCache = async () => {
      try {
        console.log('✅ Action-based system ready for workspace:', workspace?.url);
        
        setCacheSystem({
          isInitialized: true,
          error: null
        });
        
      } catch (error) {
        console.error('❌ Failed to initialize action system:', error);
        setCacheSystem({
          isInitialized: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    };

    initCache();
  }, [session, workspace?.url, pathname, isClient, status]);

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