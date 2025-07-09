"use client";

import { ResourceSettingsPage, generateResourceConfig } from '@/components/settings/resource-settings-page';

export default function IssueTypesPage() {
  const config = generateResourceConfig('issueType');
  
  return (
    <ResourceSettingsPage
      config={config}
      title="Issue Types"
      description="Manage issue types in your workspace"
    />
  );
} 