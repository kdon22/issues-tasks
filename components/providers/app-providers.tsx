// App Providers - (All State Management)
'use client';

import { SessionProvider } from 'next-auth/react';
import { QueryProvider } from './query-provider';
import { CacheProvider } from './cache-provider';

export function AppProviders({
  children,
  session,
}: {
  children: React.ReactNode;
  session: any;
}) {
  return (
    <SessionProvider session={session}>
      <QueryProvider>
        <CacheProvider>
          {children}
        </CacheProvider>
      </QueryProvider>
    </SessionProvider>
  );
} 