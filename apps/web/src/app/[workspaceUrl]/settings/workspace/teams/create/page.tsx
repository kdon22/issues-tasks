'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SettingsCard } from '@/domains/shared/layouts/settings/components/SettingsCard'
import { Input } from '@/domains/shared/components/inputs'
import { Button } from '@/domains/shared/components/inputs'
import { AvatarPicker } from '@/domains/shared/components/Avatar'
import { trpc } from '@/infrastructure/trpc/core/client'
import { useAvatar } from '@/domains/shared/hooks/useAvatar'

interface NewTeam {
  id: string
  name: string
  identifier: string
  avatarType: 'INITIALS'
  avatarColor: string
  avatarIcon: null
  avatarEmoji: null
  avatarImageUrl: null
}

export default function CreateTeamPage({ 
  params 
}: { 
  params: { workspaceUrl: string } 
}) {
  const router = useRouter()
  const utils = trpc.useContext()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [name, setName] = useState('')
  
  const newTeam: NewTeam = {
    id: 'new',
    name,
    identifier: '',
    avatarType: 'INITIALS',
    avatarColor: '#000000',
    avatarIcon: null,
    avatarEmoji: null,
    avatarImageUrl: null
  }

  const { avatarData, updateAvatar } = useAvatar(newTeam, 'team')

  const { mutate: createTeam } = trpc.team.create.useMutation({
    onSuccess: (team) => {
      utils.team.list.invalidate()
      router.push(`/${params.workspaceUrl}/settings/workspace/teams/${team.id}`)
    }
  })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const formData = new FormData(e.currentTarget)
      createTeam({
        name: formData.get('name') as string,
        identifier: (formData.get('identifier') as string).toUpperCase(),
        workspaceUrl: params.workspaceUrl,
        type: avatarData.type,
        value: avatarData.value,
        color: avatarData.color
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <SettingsCard>
      <SettingsCard.Header>
        <SettingsCard.Title>Create Team</SettingsCard.Title>
        <SettingsCard.Description>
          Create a new team in your workspace
        </SettingsCard.Description>
      </SettingsCard.Header>

      <form onSubmit={handleSubmit}>
        <SettingsCard.Content>
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <AvatarPicker
                data={avatarData}
                onChange={(data) => updateAvatar({
                  id: 'new',
                  entityType: 'team',
                  data
                })}
                disabled={isSubmitting}
              />
              <Input
                name="name"
                label="Team Name"
                required
                disabled={isSubmitting}
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  updateAvatar({
                    id: 'new',
                    entityType: 'team',
                    data: {
                      ...avatarData,
                      name: e.target.value
                    }
                  })
                }}
              />
            </div>

            <Input
              name="identifier"
              label="Team Identifier"
              helperText="Max 6 characters. Will be used as prefix for issues (e.g. KD-1)"
              required
              maxLength={6}
              pattern="[A-Z0-9]+"
              className="uppercase"
              disabled={isSubmitting}
            />
          </div>
        </SettingsCard.Content>

        <SettingsCard.Footer>
          <Button type="submit" loading={isSubmitting}>
            Create Team
          </Button>
        </SettingsCard.Footer>
      </form>
    </SettingsCard>
  )
} 