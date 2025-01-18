'use client'

import { type ReactNode } from 'react'
import { WorkspaceLayoutClient } from './WorkspaceLayoutClient'
import type { Workspace } from '../types'

interface WorkspaceLayoutProps {
  children: ReactNode
  workspace: Workspace
}

export function WorkspaceLayout({ children, workspace }: WorkspaceLayoutProps) {
  return (
    <WorkspaceLayoutClient 
      initialWorkspace={workspace}
    >
      {children}
    </WorkspaceLayoutClient>
  )
} 