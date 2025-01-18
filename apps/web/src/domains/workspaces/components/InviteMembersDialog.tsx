'use client'

import { useState } from 'react'
import { Dialog } from '@/domains/shared/components/overlays/Dialog'
import { Button } from '@/domains/shared/components/inputs/Button'
import { useWorkspaceInvites } from '../hooks/useWorkspaceInvites'
import { WorkspaceRole } from '@/domains/shared/constants/workspace'
import { User, Mail } from 'lucide-react'
import type { WorkspaceInvite } from '../types'

interface InviteMembersDialogProps {
  workspaceUrl: string
  isOpen: boolean
  onClose: () => void
}

export function InviteMembersDialog({ workspaceUrl, isOpen, onClose }: InviteMembersDialogProps) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'ADMIN' | 'MEMBER'>(WorkspaceRole.Member)
  const { invites, createInvite, cancelInvite, isLoading } = useWorkspaceInvites(workspaceUrl)

  const handleInvite = async () => {
    await createInvite({ 
      workspaceUrl,
      email,
      role 
    })
    setEmail('')
  }

  return (
    <Dialog
      isOpen={isOpen} 
      onClose={onClose}
      title="Invite Members"
      description="Invite team members to collaborate in your workspace"
    >
      <div className="space-y-4">
        {/* Email Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Email address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter email addresses"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm 
                       placeholder:text-gray-400 focus:outline-none focus:ring-2 
                       focus:ring-black focus:border-transparent"
            />
          </div>
        </div>

        {/* Role Select */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Role
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-4 w-4 text-gray-400" />
            </div>
            <select
              value={role}
              onChange={e => setRole(e.target.value as 'ADMIN' | 'MEMBER')}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm 
                       focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            >
              <option value={WorkspaceRole.Member}>Member</option>
              <option value={WorkspaceRole.Admin}>Admin</option>
            </select>
          </div>
        </div>

        {/* Pending Invites */}
        {invites.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              Pending Invites ({invites.length})
            </h3>
            <div className="space-y-2">
              {invites.map((invite: WorkspaceInvite) => (
                <div 
                  key={invite.id}
                  className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-md"
                >
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{invite.email}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => cancelInvite({ id: invite.id })}
                  >
                    Cancel
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="footer">
          <Button
            onClick={handleInvite}
            loading={isLoading}
            disabled={!email}
            className="w-full"
          >
            Send Invite
          </Button>
        </div>
      </div>
    </Dialog>
  )
} 