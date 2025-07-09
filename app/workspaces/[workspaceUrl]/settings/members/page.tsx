"use client";

import { ResourceSettingsPage, generateResourceConfig } from '@/components/settings/resource-settings-page';

export default function MembersPage() {
  const config = generateResourceConfig('member');
  
  return (
    <ResourceSettingsPage
      config={config}
      title="Members"
      description="Manage workspace members and their roles"
    />
  );
} 