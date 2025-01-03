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
  return (
    <TrpcProvider>
      <SettingsLayoutContent>
        {children}
      </SettingsLayoutContent>
    </TrpcProvider>
  )
}

function SettingsLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const workspaceUrl = pathname.split('/')[1]
  const { workspace } = useWorkspace(workspaceUrl)

  if (!workspace) return null

  return (
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
  )
} 