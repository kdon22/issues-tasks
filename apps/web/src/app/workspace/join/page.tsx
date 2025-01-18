'use client'

import { useRouter } from 'next/navigation'
import { ErrorBoundary } from '@/domains/shared/components/feedback/ErrorBoundary'
import { JoinWorkspaceForm } from '@/domains/workspaces/components/JoinWorkspaceForm'
import { LoadingSpinner } from '@/domains/shared/components/feedback/LoadingSpinner'
import { trpc } from '@/infrastructure/trpc/core/client'

export default function JoinWorkspacePage({ 
  searchParams 
}: { 
  searchParams: { token?: string } 
}) {
  const router = useRouter()
  const utils = trpc.useContext()

  const { data: invite, isLoading } = trpc.workspace.getInvite.useQuery(
    { token: searchParams.token! },
    { enabled: !!searchParams.token }
  )

  const { mutate: joinWorkspace } = trpc.workspace.join.useMutation({
    onSuccess: (data) => {
      utils.workspace.list.invalidate()
      router.push(`/${data.url}`)
    }
  })

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Join Workspace</h1>

        <JoinWorkspaceForm
          invite={invite}
          onSubmit={(data: { role: string }) => {
            joinWorkspace({
              token: searchParams.token!,
              ...data
            })
          }}
        />
      </div>
    </ErrorBoundary>
  )
} 