'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/trpc/client'
import { Input } from '@/components/ui/Input'
import { EntityAvatar } from '@/components/ui/EntityAvatar'
import { IconPicker } from '@/components/ui/IconPicker'
import { useDebounce } from '@/lib/hooks/useDebounce'

export default function ProfilePage() {
  const utils = api.useContext()
  const { data: user } = api.user.getCurrent.useQuery()
  
  const [name, setName] = useState(user?.name || '')
  const [nickname, setNickname] = useState(user?.nickname || '')
  
  const debouncedName = useDebounce(name, 500)
  const debouncedNickname = useDebounce(nickname, 500)

  const updateProfile = api.user.updateProfile.useMutation({
    onSuccess: () => {
      utils.user.getCurrent.invalidate()
    }
  })

  const updateAvatar = api.user.updateAvatar.useMutation({
    onSuccess: () => {
      utils.user.getCurrent.invalidate()
    }
  })

  // Update when initial data loads
  useEffect(() => {
    if (user) {
      setName(user.name || '')
      setNickname(user.nickname || '')
    }
  }, [user])

  // Auto-save on debounced changes
  useEffect(() => {
    if (user && (debouncedName !== user.name || debouncedNickname !== user.nickname)) {
      updateProfile.mutate({
        name: debouncedName,
        nickname: debouncedNickname,
      })
    }
  }, [debouncedName, debouncedNickname, user])

  if (!user) return null

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h2 className="text-2xl font-bold leading-7 text-gray-900">Profile Settings</h2>
        <p className="mt-1 text-sm text-gray-500">
          Manage your personal information
        </p>
      </div>

      <div className="space-y-6">
        {/* Icon & Name Section */}
        <div className="space-y-4">
          <div className="text-sm font-medium text-gray-700">Icon & Name</div>
          <div className="flex items-center gap-6">
            <IconPicker
              type={user.avatarType.toLowerCase() as "initials" | "icon" | "emoji" | "image"}
              icon={user.avatarIcon}
              color={user.avatarColor}
              onChange={(avatar) => updateAvatar.mutate({
                avatarType: avatar.type.toUpperCase() as "INITIALS" | "ICON" | "EMOJI" | "IMAGE",
                avatarIcon: avatar.icon,
                avatarColor: avatar.color,
                avatarEmoji: avatar.emoji,
                avatarImageUrl: avatar.imageUrl
              })}
            >
              <EntityAvatar type="user" id={user.id} size="lg" />
            </IconPicker>
            <div className="w-1/2">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </div>
          </div>
        </div>

        {/* Nickname */}
        <div className="w-1/2 space-y-1.5">
          <div className="text-sm font-medium text-gray-700">Nickname (Optional)</div>
          <Input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="Will be used in mentions and comments"
          />
        </div>

        {/* Email - Read Only */}
        <div className="w-1/2 space-y-1.5">
          <div className="text-sm font-medium text-gray-700">Email</div>
          <Input
            value={user.email}
            readOnly
            disabled
            className="bg-gray-50"
          />
        </div>
      </div>
    </div>
  )
} 