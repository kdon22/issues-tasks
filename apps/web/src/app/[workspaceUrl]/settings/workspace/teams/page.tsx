'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/Button'
import { IconPicker } from '@/components/ui/IconPicker'
import { Input } from '@/components/ui/Input'
import { PlusIcon } from '@heroicons/react/24/outline'

export default function TeamsPage() {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const utils = trpc.useContext()
  const { data: workspace } = trpc.workspace.getCurrent.useQuery()
  const { data: teams, isLoading } = trpc.team.list.useQuery(
    { workspaceId: workspace?.id ?? '' },
    { enabled: !!workspace?.id }
  )

  const createTeam = trpc.team.create.useMutation({
    onSuccess: () => {
      utils.team.list.invalidate()
      setShowCreateForm(false)
    },
  })

  if (isLoading) return <div>Loading...</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Teams</h1>
        <Button onClick={() => setShowCreateForm(true)}>
          <PlusIcon className="h-5 w-5 mr-2" />
          New Team
        </Button>
      </div>

      {showCreateForm && (
        <CreateTeamForm
          onSubmit={async (data) => {
            if (!workspace?.id) return
            await createTeam.mutate({
              ...data,
              workspaceId: workspace.id,
            })
          }}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      <div className="grid gap-4">
        {teams?.map((team) => (
          <TeamCard key={team.id} team={team} />
        ))}
      </div>
    </div>
  )
}

function CreateTeamForm({ onSubmit, onCancel }: {
  onSubmit: (data: { name: string; description?: string; icon?: string; iconColor?: string }) => Promise<void>
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '',
    iconColor: '#000000',
  })

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault()
        await onSubmit(formData)
      }}
      className="bg-white p-4 rounded-lg border space-y-4"
    >
      <Input
        label="Team Name"
        value={formData.name}
        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
        required
      />

      <Input
        label="Description"
        value={formData.description}
        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
      />

      <div>
        <label className="block text-sm font-medium mb-1">Team Icon</label>
        <IconPicker
          value={formData.icon}
          color={formData.iconColor}
          onChange={(icon, color) => {
            setFormData(prev => ({
              ...prev,
              icon,
              ...(color && { iconColor: color }),
            }))
          }}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Create Team
        </Button>
      </div>
    </form>
  )
}

function TeamCard({ team }: { team: any }) {
  return (
    <div className="bg-white p-4 rounded-lg border">
      <div className="flex items-center gap-4">
        {team.icon && (
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: team.iconColor || '#000000' }}
          >
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
              dangerouslySetInnerHTML={{ __html: team.icon }}
            />
          </div>
        )}
        <div>
          <h3 className="font-medium">{team.name}</h3>
          {team.description && (
            <p className="text-sm text-gray-500">{team.description}</p>
          )}
        </div>
      </div>
    </div>
  )
} 