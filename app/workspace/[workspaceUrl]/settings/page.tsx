// Workspace Settings Default Page - Linear Clone
import { redirect } from 'next/navigation';

interface Props {
  params: {
    workspaceUrl: string;
  };
}

export default function WorkspaceSettingsDefaultPage({ params }: Props) {
  redirect(`/workspace/${params.workspaceUrl}/settings/workspace`);
} 