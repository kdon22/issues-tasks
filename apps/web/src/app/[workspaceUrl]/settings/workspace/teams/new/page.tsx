'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { api } from '@/lib/trpc/client'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { IconPicker } from '@/components/ui/IconPicker'
import { Avatar } from '@/components/ui/Avatar'
import { useWorkspace } from '@/lib/hooks/useWorkspace'

export default function NewTeamPage() {
  const router = useRouter()
  const pathname = usePathname()
  const workspaceUrl = pathname.split('/')[1]
  const { workspace } = useWorkspace(workspaceUrl)
  const utils = api.useContext()

  const [name, setName] = useState('')
  const [identifier, setIdentifier] = useState('')
  const [avatarData, setAvatarData] = useState<{
    type: "initials" | "icon" | "emoji" | "image"
    icon?: string | null
    color?: string | null
    emoji?: string | null
    imageUrl?: string | null
  }>({
    type: 'initials',
    icon: null,
    color: null,
    imageUrl: null
  })

  const createTeam = api.workspace.createTeam.useMutation({
    onSuccess: () => {
      utils.workspace.getTeams.invalidate()
      if (workspace) {
        router.push(`/${workspace.url}/settings/workspace/teams`)
      }
    }
  })

  const handleIdentifierChange = (value: string) => {
    // Only allow up to 8 characters, lowercase letters, numbers, and hyphens
    const formatted = value.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 8)
    setIdentifier(formatted)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold leading-7 text-gray-900">Create new team</h2>
      </div>

      <div className="space-y-8">
        {/* Icon & Name Section */}
        <div className="space-y-4">
          <div className="text-sm font-medium text-gray-700 text-center">Icon & Name</div>
          <div className="flex flex-col items-center gap-6">
            <IconPicker
              type={avatarData.type}
              icon={avatarData.icon}
              color={avatarData.color}
              imageUrl={avatarData.imageUrl}
              onChange={setAvatarData}
            >
              <Avatar
                type={avatarData.type.toUpperCase() as "INITIALS" | "ICON" | "EMOJI" | "IMAGE"}
                name={name}
                icon={avatarData.icon}
                color={avatarData.color}
                imageUrl={avatarData.imageUrl}
                size="lg"
              />
            </IconPicker>
            <div className="w-full max-w-[400px]">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter team name"
              />
            </div>
          </div>
        </div>

        {/* Identifier */}
        <div className="flex flex-col items-center">
          <div className="w-[240px] space-y-1.5">
            <div className="text-sm font-medium text-gray-700 text-center">Identifier</div>
            <Input
              value={identifier}
              onChange={(e) => handleIdentifierChange(e.target.value)}
              placeholder="team-id"
            />
            <p className="text-sm text-gray-500 text-center">
              Used in dropdowns and issue creation
            </p>
          </div>
        </div>

        <div className="flex justify-center gap-3 mt-8">
          <Button
            variant="secondary"
            onClick={() => {
              if (workspace) {
                router.push(`/${workspace.url}/settings/workspace/teams`)
              }
            }}
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
                avatar: avatarData
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