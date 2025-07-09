"use client";

import { SettingsPageLayout } from '@/components/layout/settings-page-layout';

export default function IssueFieldsPage() {
  return (
    <SettingsPageLayout title="Issue Fields" description="Configure field sets for different issue types and contexts">
      <div className="bg-card rounded-lg border p-8 text-center">
        <h3 className="text-lg font-medium mb-2">Issue Fields Configuration</h3>
        <p className="text-muted-foreground mb-4">
          This page requires specialized implementation for field set management and configuration.
        </p>
        <p className="text-sm text-muted-foreground">
          The issue fields management will be implemented with custom forms for field set configuration.
        </p>
      </div>
    </SettingsPageLayout>
  );
} 