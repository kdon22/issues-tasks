import { WorkspaceSettings } from '@/components/workspace/WorkspaceSettings'

export default function WorkspaceGeneralSettingsPage({
  params,
}: {
  params: { workspaceUrl: string }
}) {
  return <WorkspaceSettings />
} 