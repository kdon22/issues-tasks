"use client";

import { LabelEditor } from './label-editor';
import { useParams, useRouter } from 'next/navigation';

export default function LabelsPage() {
  const params = useParams();
  const router = useRouter();
  const workspaceUrl = params?.workspaceUrl as string;
  
  const handleBack = () => {
    router.push(`/workspaces/${workspaceUrl}/settings`);
  };
  
  const handleUpdate = () => {
    // Labels are auto-updated, no need for additional action
  };

  return (
    <LabelEditor
      onBack={handleBack}
      onUpdate={handleUpdate}
    />
  );
} 