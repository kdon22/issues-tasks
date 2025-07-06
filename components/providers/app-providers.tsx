// App Providers - Linear Clone (All State Management)
'use client';

import { QueryProvider } from './query-provider';
import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'sonner';

interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <SessionProvider>
      <QueryProvider>
        {children}
        <Toaster 
          position="top-right"
          richColors
          expand
          closeButton
        />
      </QueryProvider>
    </SessionProvider>
  );
} 