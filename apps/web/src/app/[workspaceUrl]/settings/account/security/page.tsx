'use client'

import { useParams } from 'next/navigation'
import { SettingsHeader } from '@/domains/shared/layouts/settings/components/SettingsHeader'
import { SecuritySettings } from '@/domains/users/components/SecuritySettings'
import { trpc } from '@/infrastructure/trpc/core/client'

export default function Page() {
  const params = useParams<{ workspaceUrl: string }>()
  const { data: user, isLoading } = trpc.user.get.useQuery({ id: 'me' })

  if (isLoading || !user) return null

  return (
    <div>
      <SettingsHeader
        title="Security Settings"
        description="Manage your account security"
      />
      <div className="p-8">
        <SecuritySettings userId={user.id} />
      </div>
    </div>
  )
} 