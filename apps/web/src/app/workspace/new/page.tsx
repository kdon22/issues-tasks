'use client'

import { WorkspaceCreationForm } from '@/domains/workspaces/components/forms/WorkspaceCreationForm'

export default function NewWorkspacePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-2xl">
        <WorkspaceCreationForm />
      </div>
    </div>
  )
} 