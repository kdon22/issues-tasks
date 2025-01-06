'use client'

import { useWorkspaceContext } from '@/providers/WorkspaceProvider'

export function useWorkspace() {
  return useWorkspaceContext()
} 