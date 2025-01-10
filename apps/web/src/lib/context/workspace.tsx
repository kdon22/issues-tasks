'use client'

import { createContext, useContext } from 'react'
import type { Workspace } from '@prisma/client'

interface WorkspaceContextType {
  workspace: Workspace | null
  setWorkspace: (workspace: Workspace | null) => void
  isLoading: boolean
  switchWorkspace: (workspace: Workspace) => void
  updateWorkspaceData: (data: Partial<Workspace>) => void
}

export const WorkspaceContext = createContext<WorkspaceContextType | null>(null)

export function useWorkspace() {
  const context = useContext(WorkspaceContext)
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider')
  }
  return context
} 