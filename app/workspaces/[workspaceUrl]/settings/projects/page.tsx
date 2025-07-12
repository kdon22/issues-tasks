"use client";

import { ResourceSettingsPage } from '@/components/resource-settings/resource-settings-page';
import { PROJECT_SCHEMA } from '@/features/projects/projects.schema';

export default function ProjectsPage() {
  return (
    <ResourceSettingsPage
      schema={PROJECT_SCHEMA}
    />
  );
} 