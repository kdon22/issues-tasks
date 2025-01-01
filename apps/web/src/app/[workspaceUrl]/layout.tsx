'use client'

import { TRPCProvider } from '@/lib/trpc/Provider'
import { WorkspaceLayoutClient } from '@/components/ui/WorkspaceLayoutClient'

export default function WorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { workspaceUrl: string }
}) {
  return (
    <TRPCProvider>
      <WorkspaceLayoutClient>
        {children}
      </WorkspaceLayoutClient>
    </TRPCProvider>
  )
} 