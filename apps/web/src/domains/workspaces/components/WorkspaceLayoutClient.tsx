'use client'

import { type ReactNode } from 'react'
import type { Workspace } from '../types'

interface WorkspaceLayoutClientProps {
  children: ReactNode
  initialWorkspace: Workspace
}

export function WorkspaceLayoutClient({ children, initialWorkspace }: WorkspaceLayoutClientProps) {
  return (
    <div className="flex h-screen">
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
} 