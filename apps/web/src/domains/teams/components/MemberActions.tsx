'use client'

import { useState } from 'react'

import { DropdownMenu } from '@/domains/shared/components/overlays/DropdownMenu'
import { Button } from '@/domains/shared/components/inputs/Button'
import { trpc } from '@/infrastructure/trpc/core/client'

type TeamRole = 'ADMIN' | 'MEMBER'

interface TeamMember {
  userId: string
  role: TeamRole
  teamId: string
}

interface MemberActionsProps {
  member: TeamMember
  teamId: string
}

export function MemberActions({ member, teamId }: MemberActionsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const utils = trpc.useContext()

  const { mutate: updateRole } = trpc.team.updateMemberRole.useMutation({
    onSuccess: () => {
      utils.team.get.invalidate({ id: teamId })
    }
  })

  const handleUpdateRole = async (role: TeamRole) => {
    setIsLoading(true)
    try {
      await updateRole({
        teamId,
        userId: member.userId,
        role
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button variant="ghost" size="sm" loading={isLoading}>
          Actions
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Label>Change Role</DropdownMenu.Label>
        <DropdownMenu.Item 
          onClick={() => handleUpdateRole('ADMIN')}
          disabled={member.role === 'ADMIN'}
        >
          Make Admin
        </DropdownMenu.Item>
        <DropdownMenu.Item 
          onClick={() => handleUpdateRole('MEMBER')}
          disabled={member.role === 'MEMBER'}
        >
          Make Member
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  )
} 