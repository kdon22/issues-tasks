"use client";

import { ResourceSettingsPage } from '@/components/resource-settings/resource-settings-page';
import { MEMBER_SCHEMA } from '@/features/members/members.schema';

export default function MembersPage() {
  return (
    <ResourceSettingsPage
      schema={MEMBER_SCHEMA}
    />
  );
} 