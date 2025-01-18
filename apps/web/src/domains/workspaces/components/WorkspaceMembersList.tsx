'use client'

import { SettingsCard } from '@/domains/shared/layouts/settings/components/SettingsCard'
import { Button } from '@/domains/shared/components/inputs'
import { InviteMembersDialog } from './InviteMembersDialog'
import { useState } from 'react'
import { trpc } from '@/infrastructure/trpc/core/client'
import { User as UserIcon } from 'lucide-react'
import type { WorkspaceMember, User } from '../types'

interface WorkspaceMembersListProps {
  workspaceUrl: string
}

export function WorkspaceMembersList({ workspaceUrl }: WorkspaceMembersListProps) {
  const [isInviteOpen, setIsInviteOpen] = useState(false)
  const utils = trpc.useContext()

  const { data: members = [], isLoading } = trpc.workspace.listMembers.useQuery({ 
    workspaceUrl 
  }) as { data: (WorkspaceMember & { user: User })[], isLoading: boolean }

  const { mutate: removeMember } = trpc.workspace.removeMember.useMutation({
    onSuccess: () => {
      utils.workspace.listMembers.invalidate({ workspaceUrl })
    }
  })

  const { mutate: updateRole } = trpc.workspace.updateMemberRole.useMutation({
    onSuccess: () => {
      utils.workspace.listMembers.invalidate({ workspaceUrl })
    }
  })

  if (isLoading) return null

  return (
    <SettingsCard>
      <SettingsCard.Header>
        <SettingsCard.Title>Workspace Members</SettingsCard.Title>
        <Button onClick={() => setIsInviteOpen(true)}>
          Invite Members
        </Button>
      </SettingsCard.Header>

      <SettingsCard.Content>
        <div className="space-y-4">
          {members.map((member) => (
            <div 
              key={member.id}
              className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-md"
            >
              <div className="flex items-center gap-2">
                <UserIcon className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">{member.userId}</span>
                <span className="text-xs text-gray-500">{member.role}</span>
              </div>
              <div className="flex gap-2">
                <select
                  value={member.role}
                  onChange={(e) => updateRole({ 
                    workspaceUrl,
                    memberId: member.id,
                    role: e.target.value as 'ADMIN' | 'MEMBER'
                  })}
                  className="text-sm border rounded"
                >
                  <option value="MEMBER">Member</option>
                  <option value="ADMIN">Admin</option>
                </select>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeMember({ 
                    workspaceUrl,
                    memberId: member.id 
                  })}
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      </SettingsCard.Content>

      <InviteMembersDialog
        workspaceUrl={workspaceUrl}
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
      />
    </SettingsCard>
  )
} 