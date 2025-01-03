'use client'

import { WorkspaceSwitcher } from './WorkspaceSwitcher'

export function Sidebar() {
  return (
    <div className="flex items-center h-14 px-4 border-b bg-white">
      <WorkspaceSwitcher />
    </div>
  )
} 