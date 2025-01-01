'use client'

import { Sidebar } from '@/components/ui/Sidebar'

export function WorkspaceLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 overflow-auto bg-gray-50">
        {children}
      </div>
    </div>
  )
} 