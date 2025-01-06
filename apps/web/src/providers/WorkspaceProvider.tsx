'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { api } from '@/lib/trpc/client'
import type { Workspace } from '@/lib/types/workspace'


interface WorkspaceContextType {
  workspace: Workspace | null
  isLoading: boolean
  error: Error | null
  switchWorkspace: (url: string) => Promise<void>
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined)

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Don't render anything until mounted on client
  if (!mounted) {
    return null // or a loading spinner
  }

  return (
    <WorkspaceProviderInner>
      {children}
    </WorkspaceProviderInner>
  )
}

function WorkspaceProviderInner({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const params = useParams()
  const router = useRouter()
  const workspaceUrl = typeof params?.workspaceUrl === 'string' ? params.workspaceUrl : null

  const {
    data: workspace,
    isLoading,
    error
  } = api.workspace.getCurrent.useQuery(
    { url: workspaceUrl || '' },
    { 
      enabled: !!workspaceUrl && status === 'authenticated',
      retry: false
    }
  )

  const utils = api.useContext()

  const switchWorkspace = async (url: string) => {
    try {
      // Prefetch the new workspace data
      await utils.workspace.getCurrent.prefetch({ url })
      
      // Update the URL which will trigger a new query
      router.push(`/${url}/my-issues`)
    } catch (error) {
      console.error('Error switching workspace:', error)
      // Optionally show an error toast/notification
    }
  }

  // Redirect if no workspace access
  useEffect(() => {
    if (status === 'authenticated' && !isLoading && !workspace && workspaceUrl) {
      router.push('/api/workspace')
    }
  }, [status, isLoading, workspace, workspaceUrl, router])

  // Cache invalidation on workspace switch
  useEffect(() => {
    if (workspace) {
      // Invalidate relevant queries when workspace changes
      utils.workspace.invalidate()
      utils.team.invalidate()
      // Add other relevant invalidations
    }
  }, [workspace?.id, utils])

  return (
    <WorkspaceContext.Provider 
      value={{ 
        workspace: workspace || null, 
        isLoading, 
        error: error as Error | null,
        switchWorkspace 
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  )
}

export function useWorkspaceContext() {
  const context = useContext(WorkspaceContext)
  if (context === undefined) {
    throw new Error('useWorkspaceContext must be used within a WorkspaceProvider')
  }
  return context
} 