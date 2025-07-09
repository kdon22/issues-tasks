"use client";

import { ResourceSettingsPage, generateResourceConfig } from '@/components/settings/resource-settings-page';

export default function StatusesPage() {
  const config = generateResourceConfig('state');
  
  return (
    <ResourceSettingsPage
      config={config}
      title="Statuses"
      description="Manage status states in your workspace"
    />
  );
} 