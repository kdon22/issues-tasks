"use client";

import { ResourceSettingsPage } from '@/components/settings/resource-settings-page';
import { statusFlowConfig } from '@/components/settings/resource-configs/statusFlow';

export default function StatusFlowsPage() {
  return (
    <ResourceSettingsPage
      config={statusFlowConfig}
      title="Status Flows"
      description="Manage status flows and their workflow states"
    />
  );
} 