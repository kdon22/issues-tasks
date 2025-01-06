'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/trpc/client'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { AvatarPicker } from '@/components/ui/AvatarPicker'
import { Avatar } from '@/components/ui/Avatar'
import { type AvatarData } from '@/lib/types/avatar'
import { useWorkspace } from '@/lib/hooks/useWorkspace'

export default function NewTeamPage() {
  const router = useRouter()
  const { workspace } = useWorkspace()
  const utils = api.useContext()

  const [name, setName] = useState('')
  const [identifier, setIdentifier] = useState('')
  const [avatar, setAvatar] = useState<AvatarData>({
    type: 'INITIALS',
    color: 'bg-blue-500',
    icon: undefined,
    emoji: undefined,
    imageUrl: undefined,
    name: ''
  })

  if (!workspace) return null

  const createTeam = api.team.create.useMutation({
    onSuccess: () => {
      utils.team.list.invalidate()
      router.push(`/${workspace.url}/settings/workspace/teams`)
    }
  })

  const avatarData = {
    avatarType: avatar.type,
    avatarIcon: avatar.icon || null,
    avatarColor: avatar.color || null,
    avatarEmoji: avatar.emoji || null,
    avatarImageUrl: avatar.imageUrl || null
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold mb-8">Create a new team</h1>
      
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="space-y-6">
          <div>
            <AvatarPicker
              value={avatar}
              onChange={(newData) => {
                setAvatar({
                  ...newData,
                  name
                })
              }}
              name={name}
            />
          </div>

          <Input
            label="Team name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Engineering"
            className="max-w-md"
          />

          <Input
            label="Team identifier"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="eng"
            className="max-w-md"
            helperText="Used in URLs and mentions"
          />
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <Button
            variant="secondary"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (!workspace) return
              createTeam.mutate({
                workspaceUrl: workspace.url,
                name,
                identifier,
                ...avatarData
              })
            }}
            disabled={!name || !identifier || createTeam.isLoading}
          >
            {createTeam.isLoading ? 'Creating...' : 'Create team'}
          </Button>
        </div>
      </div>
    </div>
  )
} 