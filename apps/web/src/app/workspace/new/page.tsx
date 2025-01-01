import { WorkspaceCreationForm } from '@/components/workspace/WorkspaceCreationForm'

export default function NewWorkspacePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md">
        <WorkspaceCreationForm />
      </div>
    </div>
  )
} 