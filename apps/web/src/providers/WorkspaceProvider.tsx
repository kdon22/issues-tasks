'use client'

import { createContext, useContext, useState, useCallback, useMemo } from 'react'
import type { Workspace } from '@prisma/client'
import { WorkspaceContext } from '@/lib/context/workspace'

interface WorkspaceProviderProps {
  children: React.ReactNode
  initialWorkspace: Workspace | null
}

export function WorkspaceProvider({ children, initialWorkspace }: WorkspaceProviderProps) {
  const [workspace, setWorkspace] = useState(initialWorkspace)
  const [isLoading, setIsLoading] = useState(false)

  const switchWorkspace = useCallback(async (newWorkspace: Workspace) => {
    // Prevent switching to the same workspace
    if (newWorkspace.id === workspace?.id) return
    
    setIsLoading(true)
    try {
      setWorkspace(newWorkspace)
    } finally {
      setIsLoading(false)
    }
  }, [workspace?.id])

  // Memoize the context value
  const value = useMemo(() => ({
    workspace,
    setWorkspace,
    isLoading,
    switchWorkspace
  }), [workspace, isLoading, switchWorkspace])

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  )
}