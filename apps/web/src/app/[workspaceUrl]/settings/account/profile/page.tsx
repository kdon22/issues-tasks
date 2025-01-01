'use client'

import { useState, useEffect } from 'react'
import { trpc } from '@/lib/trpc/client'
import { IconPickerButton } from '@/components/ui/IconPickerButton'
import { Input } from '@/components/ui/Input'
import { useDebounce } from '@/hooks/useDebounce'

export default function ProfilePage() {
  const utils = trpc.useContext()
  const { data: profile } = trpc.user.getProfile.useQuery()
  const [formData, setFormData] = useState({
    name: '',
    nickname: '',
    email: '',
    avatarData: {
      type: 'initials' as const,
      icon: null,
      color: null,
      imageUrl: null
    }
  })

  const debouncedFormData = useDebounce(formData, 500)
  const updateProfile = trpc.user.updateProfile.useMutation({
    onSuccess: () => {
      utils.user.getProfile.invalidate()
    }
  })

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        nickname: profile.nickname || '',
        email: profile.email,
        avatarData: {
          type: profile.avatarType as 'initials' | 'icon' | 'image',
          icon: profile.avatarIcon,
          color: profile.avatarColor,
          imageUrl: profile.avatarImageUrl
        }
      })
    }
  }, [profile])

  // Auto-save when form data changes
  useEffect(() => {
    if (!profile) return
    
    if (debouncedFormData.name !== profile.name || 
        debouncedFormData.nickname !== profile.nickname ||
        debouncedFormData.avatarData.type !== profile.avatarType ||
        debouncedFormData.avatarData.icon !== profile.avatarIcon ||
        debouncedFormData.avatarData.color !== profile.avatarColor) {
      updateProfile.mutate({
        name: debouncedFormData.name,
        nickname: debouncedFormData.nickname,
        avatarData: debouncedFormData.avatarData
      })
    }
  }, [debouncedFormData, profile])

  return (
    <div className="space-y-8 max-w-xl">
      <div>
        <h2 className="text-base font-medium text-gray-700 mb-4">Profile Picture</h2>
        <div className="flex items-center gap-4">
          <IconPickerButton
            data={formData.avatarData}
            onChange={(newData) => setFormData(prev => ({
              ...prev,
              avatarData: newData
            }))}
          />
          <span className="text-sm text-gray-500">
            {updateProfile.isLoading ? 'Saving...' : 'Changes saved automatically'}
          </span>
        </div>
      </div>

      <div className="space-y-4 max-w-md">
        <Input
          label="Name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className="max-w-sm"
        />
        <Input
          label="Nickname"
          value={formData.nickname}
          onChange={(e) => setFormData(prev => ({ ...prev, nickname: e.target.value }))}
          className="max-w-sm"
        />
        <Input
          label="Email"
          value={formData.email}
          disabled
          className="max-w-sm"
        />
      </div>
    </div>
  )
} 