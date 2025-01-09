'use client'

import { MainNav } from '@/components/features/navigation/MainNav'
import type { Workspace } from '@prisma/client'
import { api } from '@/lib/trpc/client'
import { useEffect, useRef } from 'react'
import { WorkspaceProvider } from '@/providers/WorkspaceProvider'

interface WorkspaceLayoutClientProps {
  children: React.ReactNode
  initialWorkspace: Workspace | null
}

export function WorkspaceLayoutClient({ 
  children, 
  initialWorkspace 
}: WorkspaceLayoutClientProps) {
  const updateLastAccessed = api.workspace.updateLastAccessed.useMutation()
  const hasUpdated = useRef(false)

  useEffect(() => {
    if (initialWorkspace && !hasUpdated.current) {
      hasUpdated.current = true
      updateLastAccessed.mutate({ id: initialWorkspace.id })
    }
  }, [initialWorkspace?.id])

  return (
    <WorkspaceProvider initialWorkspace={initialWorkspace}>
      <div className="flex h-screen">
        <MainNav />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </WorkspaceProvider>
  )
} 