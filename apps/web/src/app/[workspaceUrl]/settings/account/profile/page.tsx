'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/trpc/client'
import { Input } from '@/components/ui/Input'
import { useDebounce } from '@/lib/hooks/useDebounce'
import { AvatarPicker } from '@/components/ui/AvatarPicker'
import { type AvatarData } from '@/lib/types/avatar'

export default function ProfilePage() {
  const utils = api.useContext()
  const { data: user } = api.user.getCurrent.useQuery()
  
  const [name, setName] = useState(user?.name || '')
  const [nickname, setNickname] = useState(user?.nickname || '')

  const updateProfile = api.user.updateProfile.useMutation({
    onSuccess: () => {
      utils.user.getCurrent.invalidate()
    }
  })

  // Return early if no user data
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
        {/* Avatar & Name Section */}
        <div className="space-y-4">
          <div className="text-sm font-medium text-gray-700">Avatar & Name</div>
          <div className="flex items-center gap-6">
            <AvatarPicker
              value={{
                type: user?.avatarType || 'INITIALS',
                icon: user?.avatarIcon || undefined,
                color: user?.avatarColor || 'bg-blue-500',
                emoji: user?.avatarEmoji || undefined,
                imageUrl: user?.avatarImageUrl || undefined,
                name: user?.name || ''
              }}
              onChange={(newData) => {
                updateProfile.mutate({
                  name,
                  nickname,
                  type: newData.type,
                  icon: newData.icon || null,
                  color: newData.color || null,
                  emoji: newData.emoji || null,
                  imageUrl: newData.imageUrl || null
                })
              }}
              name={name}
            />
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
            value={user?.email || ''}
            readOnly
            disabled
            className="bg-gray-50"
          />
        </div>
      </div>
    </div>
  )
} 