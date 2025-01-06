'use client'

import { useWorkspace } from '@/lib/hooks/useWorkspace'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function CatchAllPage() {
  const router = useRouter()
  const { workspace, isLoading } = useWorkspace()

  useEffect(() => {
    if (!isLoading && workspace) {
      // Redirect to my-issues if no specific path
      router.replace(`/${workspace.url}/my-issues`)
    }
  }, [workspace, isLoading, router])

  if (isLoading) {
    return <div>Loading...</div>
  }

  return null
} 