'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { UserIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { UserAvatar } from '@/components/ui/UserAvatar'

export default function TeamMembersPage({ params }: { params: { teamId: string } }) {
  const [showInviteForm, setShowInviteForm] = useState(false)
  const utils = trpc.useContext()
  
  const { data: members, isLoading } = trpc.teamMember.list.useQuery({ 
    teamId: params.teamId 
  })

  const updateRole = trpc.teamMember.updateRole.useMutation({
    onSuccess: () => {
      utils.teamMember.list.invalidate()
    },
  })

  const removeMember = trpc.teamMember.remove.useMutation({
    onSuccess: () => {
      utils.teamMember.list.invalidate()
    },
  })

  if (isLoading) return <div>Loading...</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Team Members</h1>
        <Button onClick={() => setShowInviteForm(true)}>
          Invite Member
        </Button>
      </div>

      {showInviteForm && (
        <InviteMemberForm
          teamId={params.teamId}
          onClose={() => setShowInviteForm(false)}
        />
      )}

      <div className="bg-white rounded-lg border">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Member
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {members?.map((member) => (
              <tr key={member.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <UserAvatar 
                        user={member.user}
                        size="md"
                      />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {member.user.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {member.user.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Select
                    value={member.role}
                    onChange={(value) => {
                      updateRole.mutate({
                        teamId: params.teamId,
                        userId: member.user.id,
                        role: value as 'MEMBER' | 'ADMIN' | 'GUEST',
                      })
                    }}
                    options={[
                      { label: 'Member', value: 'MEMBER' },
                      { label: 'Admin', value: 'ADMIN' },
                      { label: 'Guest', value: 'GUEST' },
                    ]}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      removeMember.mutate({
                        teamId: params.teamId,
                        userId: member.user.id,
                      })
                    }}
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function InviteMemberForm({ teamId, onClose }: { teamId: string; onClose: () => void }) {
  const utils = trpc.useContext()
  const addMember = trpc.teamMember.add.useMutation({
    onSuccess: () => {
      utils.teamMember.list.invalidate()
      onClose()
    },
  })

  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'MEMBER' | 'ADMIN' | 'GUEST'>('MEMBER')

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault()
        // Here you would typically:
        // 1. Look up user by email
        // 2. Add them to the team if found
        // For now, we'll just show the form structure
      }}
      className="bg-white p-4 rounded-lg border space-y-4"
    >
      <Input
        label="Email Address"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <Select
        label="Role"
        value={role}
        onChange={(value) => setRole(value as 'MEMBER' | 'ADMIN' | 'GUEST')}
        options={[
          { label: 'Member', value: 'MEMBER' },
          { label: 'Admin', value: 'ADMIN' },
          { label: 'Guest', value: 'GUEST' },
        ]}
      />

      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">
          Invite Member
        </Button>
      </div>
    </form>
  )
} 