// Workspace Settings Default Page - Linear Clone
import { redirect } from 'next/navigation';

interface Props {
  params: Promise<{
    workspaceUrl: string;
  }>;
}

export default async function WorkspaceSettingsDefaultPage({ params }: Props) {
  const { workspaceUrl } = await params;
  redirect(`/workspaces/${workspaceUrl}/settings/workspace`);
} 