import { SettingsSidebar } from '@/components/ui/SettingsSidebar'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'

export default async function SettingsLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { workspaceUrl: string }
}) {
  const session = await getSession()
  
  // Redirect if no session or workspace
  if (!session?.workspace?.url) {
    redirect('/')
  }

  // Verify workspaceUrl matches session
  if (params.workspaceUrl !== session.workspace.url) {
    redirect(`/${session.workspace.url}/settings/workspace/general`)
  }

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900">
      <SettingsSidebar />
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  )
} 