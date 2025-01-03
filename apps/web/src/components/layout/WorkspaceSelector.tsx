'use client'

import { api } from '@/lib/trpc/client'

export function WorkspaceSelector() {
  const { data: workspaces } = api.workspace.list.useQuery()
  // ... rest of component
} 