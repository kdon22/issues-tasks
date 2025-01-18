'use client'

import { Button } from '@/domains/shared/components/inputs'
import type { WorkspaceInvite, Workspace } from '../types'

interface JoinWorkspaceFormProps {
  invite?: WorkspaceInvite & { 
    workspace: Pick<Workspace, 'name' | 'url'> 
  }
  onSubmit: (data: { role: 'ADMIN' | 'MEMBER' }) => void
}

export function JoinWorkspaceForm({ invite, onSubmit }: JoinWorkspaceFormProps) {
  if (!invite) {
    return (
      <div className="text-center">
        <p className="text-sm text-gray-600">
          This invitation link is invalid or has expired.
        </p>
      </div>
    )
  }

  return (
    <div className="text-center">
      <p className="text-sm text-gray-600 mb-4">
        You have been invited to join {invite.workspace.name}
      </p>
      <Button onClick={() => onSubmit({ role: invite.role })}>
        Join Workspace
      </Button>
    </div>
  )
} 