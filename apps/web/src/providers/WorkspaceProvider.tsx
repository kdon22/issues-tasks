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
    if (newWorkspace.id === workspace?.id) return
    setIsLoading(true)
    try {
      setWorkspace(newWorkspace)
    } finally {
      setIsLoading(false)
    }
  }, [workspace?.id])

  const updateWorkspaceData = useCallback((data: Partial<Workspace>) => {
    setWorkspace(prev => {
      if (!prev) return null
      return { ...prev, ...data }
    })
  }, [])

  const value = useMemo(() => ({
    workspace,
    setWorkspace,
    isLoading,
    switchWorkspace,
    updateWorkspaceData
  }), [workspace, isLoading, switchWorkspace, updateWorkspaceData])

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  )
}