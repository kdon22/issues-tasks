"use client";

import { ResourceSettingsPage, generateResourceConfig } from '@/components/settings/resource-settings-page';

export default function ProjectsPage() {
  const config = generateResourceConfig('project');
  
  return (
    <ResourceSettingsPage
      config={config}
      title="Projects"
      description="Manage projects in your workspace"
    />
  );
} 