'use client'

import { Sidebar } from '@/components/features/sidebar/Sidebar'

export function WorkspaceLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
} 