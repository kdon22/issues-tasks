'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'
import { Input } from '@/components/ui/Input'
import { InviteMembersModal } from '@/components/workspace/InviteMembersModal'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { UserIcon, XMarkIcon } from '@heroicons/react/24/outline'

export default function WorkspaceMembersPage() {
  const [showInviteForm, setShowInviteForm] = useState(false)
  const utils = trpc.useContext()
  const { data: workspace } = trpc.workspace.getCurrent.useQuery()
  
  const { data: members, isLoading } = trpc.workspace.listMembers.useQuery(
    { workspaceId: workspace?.id ?? '' },
    { enabled: !!workspace?.id }
  )

  const updateRole = trpc.workspace.updateMemberRole.useMutation({
    onSuccess: () => {
      utils.workspace.listMembers.invalidate()
    },
  })

  const removeMember = trpc.workspace.removeMember.useMutation({
    onSuccess: () => {
      utils.workspace.listMembers.invalidate()
    },
  })

  if (isLoading) return <div>Loading...</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Workspace Members</h1>
        <Button onClick={() => setShowInviteForm(true)}>
          Invite Member
        </Button>
      </div>

      {showInviteForm && (
        <InviteMemberForm
          workspaceId={workspace?.id ?? ''}
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Teams
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
                      {member.user.icon ? (
                        <div
                          className="h-10 w-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: member.user.iconColor || '#000000' }}
                        >
                          <svg
                            className="w-6 h-6 text-white"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            dangerouslySetInnerHTML={{ __html: member.user.icon }}
                          />
                        </div>
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                          <UserIcon className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
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
                      if (!workspace?.id) return
                      updateRole.mutate({
                        workspaceId: workspace.id,
                        userId: member.user.id,
                        role: value as 'OWNER' | 'ADMIN' | 'MEMBER',
                      })
                    }}
                    options={[
                      { label: 'Owner', value: 'OWNER' },
                      { label: 'Admin', value: 'ADMIN' },
                      { label: 'Member', value: 'MEMBER' },
                    ]}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex gap-1">
                    {member.user.teams?.map((team) => (
                      <span
                        key={team.id}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {team.name}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      if (!workspace?.id) return
                      removeMember.mutate({
                        workspaceId: workspace.id,
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

function InviteMemberForm({ workspaceId, onClose }: { workspaceId: string; onClose: () => void }) {
  const utils = trpc.useContext()
  const inviteMember = trpc.workspace.inviteMember.useMutation({
    onSuccess: () => {
      utils.workspace.listMembers.invalidate()
      onClose()
    },
  })

  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'MEMBER' | 'ADMIN'>('MEMBER')

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault()
        await inviteMember.mutate({
          workspaceId,
          email,
          role,
        })
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
        onChange={(value) => setRole(value as 'MEMBER' | 'ADMIN')}
        options={[
          { label: 'Member', value: 'MEMBER' },
          { label: 'Admin', value: 'ADMIN' },
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