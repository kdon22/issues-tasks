"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CreateProjectDialog } from './create-project-dialog';

interface ProjectsPageContentProps {
  workspaceUrl: string;
}

export function ProjectsPageContent({ workspaceUrl }: ProjectsPageContentProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  return (
    <>
      <div className="space-y-6">
        {/* Projects content would go here */}
        <div className="bg-white rounded-lg border p-6">
          <div className="text-center space-y-4">
            <h3 className="text-lg font-semibold">No Projects Yet</h3>
            <p className="text-gray-600">
              You haven't created any projects yet. Start by creating your first project.
            </p>
            <Button 
              onClick={() => setShowCreateDialog(true)}
              className="w-full"
            >
              Create Project
            </Button>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border p-6">
          <div className="text-center space-y-4">
            <h3 className="text-lg font-semibold">Need Teams?</h3>
            <p className="text-gray-600">
              Create teams to organize your projects better.
            </p>
            <Button variant="outline" className="w-full" asChild>
              <a href={`/workspaces/${workspaceUrl}/settings/teams`}>
                Manage Teams
              </a>
            </Button>
          </div>
        </div>
      </div>

      <CreateProjectDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        workspaceUrl={workspaceUrl}
      />
    </>
  );
} 