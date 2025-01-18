'use client'

import { useParams } from 'next/navigation'
import { redirect } from 'next/navigation'

export default function Page() {
  const params = useParams<{ workspaceUrl: string }>()
  redirect(`/${params.workspaceUrl}/settings/account/profile`)
} 