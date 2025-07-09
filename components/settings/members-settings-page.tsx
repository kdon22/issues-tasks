"use client";

import { ResourceSettingsPage, generateResourceConfig } from './resource-settings-page';

export function MembersSettingsPage() {
  const config = generateResourceConfig('member');
  
  return (
    <ResourceSettingsPage 
      config={config} 
      title="Members" 
      description="Manage team members and their permissions in your workspace"
    />
  );
} 