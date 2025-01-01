'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'

export default function ProfilePage() {
  const { data: profile } = trpc.user.getProfile.useQuery()
  const utils = trpc.useContext()

  const updateProfile = trpc.user.updateProfile.useMutation({
    onSuccess: () => {
      utils.user.getProfile.invalidate()
    }
  })

  const [name, setName] = useState(profile?.name || '')
  const [email, setEmail] = useState(profile?.email || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateProfile.mutate({
      name,
      email,
      avatar: {
        type: 'initials',  // Default to initials if no other type selected
        color: profile?.avatarColor || undefined,
        icon: profile?.avatarIcon || undefined,
        imageUrl: profile?.avatarImageUrl || undefined
      }
    })
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-lg font-medium text-gray-900">Profile Picture</h2>
        <div className="mt-2">
          <Avatar
            name={profile?.name || ''}
            src={profile?.avatarImageUrl}
            icon={profile?.avatarIcon}
            color={profile?.avatarColor}
            size="lg"
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1"
          />
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={updateProfile.isLoading}>
            {updateProfile.isLoading ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </form>
    </div>
  )
} 