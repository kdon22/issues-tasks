import { notFound } from 'next/navigation'
interface WorkspacePageProps {
  params: {
    workspaceUrl: string
    path: string[]
  }
}

export default function WorkspacePage({ params }: WorkspacePageProps) {
  const { path } = params

  // Handle different workspace routes
  switch (path[0]) {
    case 'my-issues':
      return (
        <div className="p-8">
          <h1 className="text-2xl font-semibold mb-4">My Issues</h1>
          {/* Content will be added later */}
        </div>
      )

    case 'inbox':
      return (
        <div className="p-8">
          <h1 className="text-2xl font-semibold mb-4">Inbox</h1>
          {/* Content will be added later */}
        </div>
      )

    case 'all-issues':
      return (
        <div className="p-8">
          <h1 className="text-2xl font-semibold mb-4">All Issues</h1>
          {/* Content will be added later */}
        </div>
      )

    case 'active-issues':
      return (
        <div className="p-8">
          <h1 className="text-2xl font-semibold mb-4">Active Issues</h1>
          {/* Content will be added later */}
        </div>
      )

    case 'settings':
      if (path[1] === 'account' && path[2] === 'preferences') {
        return (
          <div className="p-8">
            <h1 className="text-2xl font-semibold mb-4">Account Preferences</h1>
            {/* Preferences content */}
          </div>
        )
      }
      break
  }

  return notFound()
} 