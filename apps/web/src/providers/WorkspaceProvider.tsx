'use client'

import { createContext, useContext, useState } from 'react'
import type { Workspace } from '@prisma/client'

interface WorkspaceContextType {
  workspace: Workspace | null
  setWorkspace: (workspace: Workspace | null) => void
}

export const WorkspaceContext = createContext<WorkspaceContextType | null>(null)

export function useWorkspace() {
  const context = useContext(WorkspaceContext)
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider')
  }
  return context
}

interface WorkspaceProviderProps {
  children: React.ReactNode
  initialWorkspace: Workspace | null
}

export function WorkspaceProvider({ children, initialWorkspace }: WorkspaceProviderProps) {
  const [workspace, setWorkspace] = useState(initialWorkspace)

  return (
    <WorkspaceContext.Provider value={{ workspace, setWorkspace }}>
      {children}
    </WorkspaceContext.Provider>
  )
} 