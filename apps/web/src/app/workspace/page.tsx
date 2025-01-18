'use client'

import { useRouter, useParams } from 'next/navigation'
import { trpc } from '@/infrastructure/trpc/core/client'
import Loading from '@/domains/shared/components/feedback/Loading'

export default function WorkspacePage() {
  const router = useRouter()
  const params = useParams()
  const utils = trpc.useContext()
  
  const { data: workspace } = trpc.workspace.get.useQuery(
    { id: params.workspaceUrl as string }
  )

  const { data: preferences } = trpc.user.get.useQuery(
    { id: workspace?.id },
    { enabled: !!workspace }
  )

  // Redirect to default view
  // useEffect(() => {
  //   if (workspace) {
  //     const defaultView = preferences?.defaultHomeView || 'my-issues'
  //     router.push(`/${workspace.url}/${defaultView}`)
  //   }
  // }, [workspace, preferences, router])

  return <Loading />
} 