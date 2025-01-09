import { getWorkspace as getWorkspaceAction } from '@/lib/actions/workspace'

export async function getWorkspace(url: string) {
  return getWorkspaceAction(url)
} 