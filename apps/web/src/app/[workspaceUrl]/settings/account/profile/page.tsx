'use client'

import { useState, useEffect, useRef } from 'react'
import { trpc } from '@/lib/trpc/client'
import { Input } from '@/components/ui/Input'
import { IconPicker } from '@/components/ui/IconPicker'
import { ICONS } from '@/constants/icons'

export default function ProfilePage() {
  const utils = trpc.useContext()
  const { data: profile, isLoading } = trpc.user.getProfile.useQuery()
  const updateTimeoutRef = useRef<NodeJS.Timeout>()
  
  const updateProfile = trpc.user.updateProfile.useMutation({
    onSuccess: () => {
      utils.user.getProfile.invalidate()
    },
    onMutate: async (newData) => {
      await utils.user.getProfile.cancel()
      const previousData = utils.user.getProfile.getData()

      utils.user.getProfile.setData(undefined, old => ({
        ...old,
        ...newData,
      }))

      return { previousData }
    },
    onError: (err, newData, context) => {
      utils.user.getProfile.setData(undefined, context?.previousData)
    }
  })

  const [formData, setFormData] = useState({
    icon: profile?.icon || ICONS[0].svg,
    iconColor: profile?.iconColor || '#25A70B',
    name: profile?.name || '',
    nickname: profile?.nickname || '',
  })

  useEffect(() => {
    if (profile) {
      setFormData({
        icon: profile.icon || ICONS[0].svg,
        iconColor: profile.iconColor || '#25A70B',
        name: profile.name || '',
        nickname: profile.nickname || '',
      })
    }
  }, [profile])

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current)
    }

    updateTimeoutRef.current = setTimeout(() => {
      updateProfile.mutate({ ...formData, [field]: value })
    }, 500)
  }

  const handleIconChange = (icon: string, color?: string) => {
    const newData = {
      ...formData,
      icon,
      ...(color && { iconColor: color })
    }
    setFormData(newData)
    updateProfile.mutate(newData)
  }

  if (isLoading) return <div>Loading...</div>

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-2xl font-semibold mb-8">Profile</h1>

      <div className="space-y-12">
        <section>
          <h2 className="text-lg font-medium mb-6">Profile picture</h2>
          <div className="flex items-start space-x-4">
            <IconPicker
              value={formData.icon}
              color={formData.iconColor}
              onChange={handleIconChange}
            />
          </div>
        </section>

        <section>
          <h2 className="text-lg font-medium mb-6">Personal information</h2>
          <div className="space-y-8">
            <div>
              <Input
                label="Full name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                helperText="Your full name"
              />
            </div>

            <div>
              <Input
                label="Nickname"
                value={formData.nickname}
                onChange={(e) => handleChange('nickname', e.target.value)}
                helperText="Nickname or first name, however you want to be called in IssuesTasks"
              />
            </div>

            <div>
              <Input
                label="Email"
                value={profile?.email}
                disabled
                className="bg-gray-50"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  )
} 