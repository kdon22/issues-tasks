"use client";

import { ResourceSettingsPage } from '@/components/resource-settings/resource-settings-page';
import { TEAM_SCHEMA } from '@/features/teams/teams.schema';

export default function TeamsPage() {
  return (
    <ResourceSettingsPage
      schema={TEAM_SCHEMA}
    />
  );
} 