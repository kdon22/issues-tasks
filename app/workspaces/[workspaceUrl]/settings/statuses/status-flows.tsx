"use client";

import { ResourceSettingsPage } from '@/components/resource-settings/resource-settings-page';
import { STATUS_FLOW_SCHEMA } from '@/features/admin/workflows/schema';

export default function StatusFlowsPage() {
  return (
    <ResourceSettingsPage
      schema={STATUS_FLOW_SCHEMA}
    />
  );
} 