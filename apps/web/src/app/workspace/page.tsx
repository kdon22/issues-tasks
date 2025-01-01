'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import Loading from '@/components/ui/Loading'

export default function WorkspacePage() {
  const router = useRouter()
  const { data: workspace, isLoading: workspaceLoading } = trpc.workspace.getCurrent.useQuery(undefined, {
    retry: false,
  })
  const { data: preferences, isLoading: preferencesLoading } = trpc.user.getPreferences.useQuery(
    { workspaceId: workspace?.id ?? '' },
    { 
      enabled: !!workspace,
      retry: false,
    }
  )

  useEffect(() => {
    if (workspace) {
      const defaultView = preferences?.defaultHomeView || 'my-issues'
      router.push(`/${workspace.url}/${defaultView}`)
    }
  }, [workspace, preferences, router])

  if (workspaceLoading || preferencesLoading) {
    return <Loading />
  }

  return null
} 