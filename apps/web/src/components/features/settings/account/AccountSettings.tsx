'use client'

import { api } from '@/lib/trpc/client'
import { AvatarPicker } from '@/components/ui/AvatarPicker/AvatarPicker'
import { type AvatarData, toAvatarData } from '@/lib/types/avatar'

export function AccountSettings() {
  const utils = api.useContext()
  const { data: user } = api.user.getCurrent.useQuery()

  const updateAvatar = api.user.updateAvatar.useMutation({
    onSuccess: () => {
      utils.user.getCurrent.invalidate()
    }
  })

  if (!user) return null

  const handleAvatarChange = async (avatarData: AvatarData) => {
    await updateAvatar.mutateAsync({
      name: user.name || 'Unknown',
      type: avatarData.type,
      icon: avatarData.type === 'ICON' ? avatarData.icon : null,
      color: 'color' in avatarData ? avatarData.color : null,
      emoji: avatarData.type === 'EMOJI' ? avatarData.emoji : null,
      imageUrl: avatarData.type === 'IMAGE' ? avatarData.imageUrl : null
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Profile Picture</h3>
        <AvatarPicker
          data={toAvatarData({ ...user, name: user.name || 'Unknown' })}
          onChange={handleAvatarChange}
        />
      </div>
    </div>
  )
} 