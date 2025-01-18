'use client'

import { useTeamMembers } from './useTeamMembers'
import { useAuth } from '@/domains/auth/hooks/useAuth'

export function useTeamAccess(teamId: string) {
  const { user } = useAuth()
  const { members } = useTeamMembers(teamId)

  const currentMember = members?.find(member => member.userId === user?.id)
  const isAdmin = currentMember?.role === 'ADMIN'
  const isMember = !!currentMember

  return {
    isAdmin,
    isMember,
    currentMember
  }
} 