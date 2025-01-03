'use client'

import { SettingsNav } from './_components/SettingsNav'
import { useWorkspace } from '@/lib/hooks/useWorkspace'
import { TrpcProvider } from '@/providers/TrpcProvider'
import { usePathname } from 'next/navigation'

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname() || ''
  const workspaceUrl = pathname.split('/')[1] || ''
  const { workspace, isLoading } = useWorkspace(workspaceUrl)

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!workspace) {
    return <div>Workspace not found</div>
  }

  return (
    <TrpcProvider>
      <div className="flex min-h-screen">
        {/* Settings Sidebar */}
        <div className="w-64 border-r border-gray-200 bg-white">
          <div className="p-4 sticky top-0">
            <SettingsNav />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {children}
        </div>
      </div>
    </TrpcProvider>
  )
} 