import { trpc } from '@/infrastructure/trpc/core/client'

export function useWorkspaces() {
  const utils = trpc.useContext()
  
  const { data: workspaces, isLoading } = trpc.workspace.list.useQuery()

  const { mutate: createWorkspace } = trpc.workspace.create.useMutation({
    onSuccess: () => {
      utils.workspace.list.invalidate()
    }
  })

  const { mutate: updateWorkspace } = trpc.workspace.update.useMutation({
    onSuccess: () => {
      utils.workspace.list.invalidate()
    }
  })

  return {
    workspaces,
    isLoading,
    createWorkspace,
    updateWorkspace
  }
} 