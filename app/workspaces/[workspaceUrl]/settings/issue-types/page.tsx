"use client";

import { ResourceSettingsPage } from '@/components/resource-settings/resource-settings-page';
import { ISSUE_TYPE_SCHEMA } from '@/features/admin/issue-types/schema';

export default function IssueTypesPage() {
  return (
    <ResourceSettingsPage
      schema={ISSUE_TYPE_SCHEMA}
    />
  );
} 