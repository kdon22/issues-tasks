'use client'

import { useState } from 'react'
import { Dialog } from '../ui/Dialog'
import { Input } from '../ui/Input'
import { Dropdown } from '../ui/Dropdown'
import { MultiSelect } from '../ui/MultiSelect'
import { trpc } from '../../lib/trpc/client'

interface InviteMembersModalProps {
  isOpen: boolean
  onClose: () => void
  workspaceId: string
}

export function InviteMembersModal({ isOpen, onClose, workspaceId }: InviteMembersModalProps) {
  const [emails, setEmails] = useState('')
  const [role, setRole] = useState('MEMBER')
  const [selectedTeams, setSelectedTeams] = useState<string[]>([])

  const { data: teams } = trpc.team.list.useQuery({ workspaceId })
  
  const inviteMutation = trpc.workspace.inviteMembers.useMutation({
    onSuccess: () => {
      onClose()
      setEmails('')
      setRole('MEMBER')
      setSelectedTeams([])
    }
  })

  const handleInvite = () => {
    const emailList = emails.split(',').map(email => email.trim())
    
    inviteMutation.mutate({
      workspaceId,
      invites: emailList.map(email => ({
        email,
        role,
        teamIds: selectedTeams
      }))
    })
  }

  const teamOptions = teams?.map(team => ({
    label: team.name,
    value: team.id,
    icon: team.icon,
    iconColor: team.iconColor
  })) || []

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Invite to your workspace"
    >
      <div className="space-y-6 p-6">
        <div>
          <label className="block text-sm font-medium mb-2">Email</label>
          <Input
            placeholder="email@example.com, email2@example.com..."
            value={emails}
            onChange={(e) => setEmails(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Role</label>
          <Dropdown
            value={role}
            onChange={setRole}
            options={[
              { label: 'Owner', value: 'OWNER' },
              { label: 'Admin', value: 'ADMIN' },
              { label: 'Member', value: 'MEMBER' }
            ]}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Add to teams (optional)</label>
          <MultiSelect
            value={selectedTeams}
            onChange={setSelectedTeams}
            options={teamOptions}
            placeholder="Select teams..."
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            onClick={handleInvite}
          >
            Send invites
          </button>
        </div>
      </div>
    </Dialog>
  )
} 