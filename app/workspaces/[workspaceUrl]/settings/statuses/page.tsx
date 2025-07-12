"use client";

import { ResourceSettingsPage } from '@/components/resource-settings/resource-settings-page';
import { STATE_SCHEMA } from '@/features/admin/statuses';

export default function StatusesPage() {
  return (
    <ResourceSettingsPage
      schema={STATE_SCHEMA}
    />
  );
} 