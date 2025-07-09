"use client";

import { ResourceSettingsPage, generateResourceConfig } from '@/components/settings/resource-settings-page';

export default function LabelsPage() {
  const config = generateResourceConfig('label');
  
  return (
    <ResourceSettingsPage
      config={config}
      title="Labels"
      description="Manage labels in your workspace"
    />
  );
} 