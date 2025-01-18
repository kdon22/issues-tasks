'use client'

import { trpc } from '@/infrastructure/trpc/core/client'

export function useProfileSettings({ userId }: { userId: string }) {
  console.log('useProfileSettings called with userId:', userId)
  
  const utils = trpc.useContext()
  
  const { data: user, isLoading } = trpc.user.get.useQuery({ id: userId })
  console.log('trpc.user.get returned:', { user, isLoading })
  
  const { mutate: updateProfile } = trpc.user.update.useMutation({
    onSuccess: () => {
      utils.user.get.invalidate({ id: userId })
    }
  })

  const profile = user ? {
    ...user,
    name: user.name || user.email.split('@')[0],
    avatarType: user.avatarType,
    avatarColor: user.avatarColor || '#000000',
    avatarIcon: user.avatarIcon,
    avatarEmoji: user.avatarEmoji,
    avatarImageUrl: user.avatarImageUrl
  } : null
  
  console.log('useProfileSettings returning:', { profile, isLoading })

  return {
    profile,
    isLoading,
    updateProfile
  }
} 