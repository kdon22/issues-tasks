"use client";

import { ResourceSettingsPage, generateResourceConfig } from '@/components/settings/resource-settings-page';

export default function TeamsPage() {
  const config = generateResourceConfig('team');
  
  return (
    <ResourceSettingsPage
      config={config}
      title="Teams"
      description="Manage teams in your workspace"
    />
  );
} 