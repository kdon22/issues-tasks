'use client'

import { useState, useEffect } from 'react'
import { trpc } from '@/lib/trpc/client'
import { Input } from '@/components/ui/Input'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { IconPicker } from '@/components/ui/IconPicker'
import { useDebounce } from '@/hooks/useDebounce'

export default function ProfilePage() {
  const utils = trpc.useContext()
  const { data: user } = trpc.user.getCurrent.useQuery()
  
  const [name, setName] = useState(user?.name || '')
  const [nickname, setNickname] = useState(user?.nickname || '')
  
  const debouncedName = useDebounce(name, 500)
  const debouncedNickname = useDebounce(nickname, 500)

  const updateProfile = trpc.user.updateProfile.useMutation({
    onSuccess: () => {
      utils.user.getCurrent.invalidate()
    }
  })

  const updateAvatar = trpc.user.updateAvatar.useMutation({
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
              type={user.avatarType}
              icon={user.avatarIcon}
              color={user.avatarColor}
              imageUrl={user.avatarImageUrl}
              onChange={(avatar) => updateAvatar.mutate(avatar)}
            >
              <UserAvatar user={user} size="lg" />
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