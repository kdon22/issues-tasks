'use client'

import { api } from '@/lib/trpc/client'
import { AvatarPicker } from '@/components/ui/AvatarPicker/AvatarPicker'
import { type AvatarData, toAvatarData, toAvatarFields } from '@/lib/types/avatar'

interface TeamGeneralSettingsProps {
  teamId: string
}

export function TeamGeneralSettings({ teamId }: TeamGeneralSettingsProps) {
  const utils = api.useContext()
  const { data: team } = api.team.get.useQuery({ id: teamId })

  const updateAvatar = api.team.updateAvatar.useMutation({
    onSuccess: () => {
      utils.team.get.invalidate({ id: teamId })
      utils.team.list.invalidate()
    }
  })

  if (!team) return null

  const handleAvatarChange = async (avatarData: AvatarData) => {
    await updateAvatar.mutateAsync({
      teamId,
      name: team.name,
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
        <h3 className="text-lg font-medium">Team Avatar</h3>
        <AvatarPicker
          data={toAvatarData({ ...team, name: team.name })}
          onChange={handleAvatarChange}
        />
      </div>
    </div>
  )
} 