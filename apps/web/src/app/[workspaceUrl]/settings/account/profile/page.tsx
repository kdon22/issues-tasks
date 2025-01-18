'use client'

import { useParams } from 'next/navigation'
import { SettingsHeader } from '@/domains/shared/layouts/settings/components/SettingsHeader'
import { ProfileSettings } from '@/domains/users/components/ProfileSettings'
import { trpc } from '@/infrastructure/trpc/core/client'

export default function Page() {
  console.log('Profile page rendering')
  const params = useParams<{ workspaceUrl: string }>()
  const { data: user, isLoading, error } = trpc.user.get.useQuery(
    { id: 'me' },
    {
      retry: false,
      onError: (err) => console.error('User query error:', err)
    }
  )
  
  console.log('Profile page user query:', { user, isLoading, error })

  if (isLoading) return <div>Loading...</div>
  if (!user) return <div>Error loading user data</div>

  return (
    <div className="flex-1">
      <SettingsHeader
        title="Profile Settings"
        description="Manage your profile information"
      />
      <div className="p-8">
        <ProfileSettings userId={user.id} />
      </div>
    </div>
  )
} 