import { api } from '@/lib/trpc/client'
import { type AvatarData } from '@/lib/types/avatar'
import type { AvatarInput } from '@/lib/trpc/routers/avatar'

type EntityType = 'user' | 'team' | 'workspace'

export function useAvatar(type: EntityType, id: string) {
  const trpc = api.useContext()
  
  const { 
    data, 
    isLoading,
    error 
  } = api.avatar.get.useQuery(
    { type, id },
    { 
      staleTime: 1000 * 60 * 5,
      cacheTime: 1000 * 60 * 30,
      retry: false,
      onError: (error) => {
        if (error.data?.httpStatus === 401) {
          window.location.href = '/auth/signin'
        }
      }
    }
  )

  const updateAvatar = api.avatar.update.useMutation({
    onMutate: async (newData: { type: EntityType; id: string; data: AvatarInput }) => {
      await trpc.avatar.get.cancel()
      const previousData = trpc.avatar.get.getData({ type: newData.type, id: newData.id })
      
      trpc.avatar.get.setData(
        { type: newData.type, id: newData.id },
        newData.data as unknown as AvatarData
      )
      
      return { previousData }
    },
    onError: (err, newData, context) => {
      if (context?.previousData) {
        trpc.avatar.get.setData(
          { type, id },
          context.previousData
        )
      }
    },
    onSettled: () => {
      trpc.avatar.get.invalidate({ type, id })
    }
  })

  return {
    avatar: data,
    isLoading,
    error,
    updateAvatar: (data: AvatarInput) => updateAvatar.mutate({ type, id, data }),
    isUpdating: updateAvatar.isLoading
  }
} 