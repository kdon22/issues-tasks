'use client'

import { formatDistanceToNow } from 'date-fns'
import { Avatar } from '@/domains/shared/components/Avatar'
import { trpc } from '@/infrastructure/trpc/core/client'

interface TeamActivityFeedProps {
  teamId: string
}

type ActivityType = 'MEMBER_ADDED' | 'MEMBER_REMOVED' | 'MEMBER_ROLE_UPDATED' | 
                   'SETTINGS_UPDATED' | 'TEAM_UPDATED' | 'TEAM_DELETED'

interface TeamActivity {
  id: string
  type: ActivityType
  teamId: string
  userId: string
  data: Record<string, any>
  createdAt: Date
  user: {
    id: string
    name: string
    avatarType: string
    avatarColor: string | null
  }
}

export function TeamActivityFeed({ teamId }: TeamActivityFeedProps) {
  const { data: activities = [], isLoading } = trpc.team.activity.list.useQuery<TeamActivity[]>(
    { teamId }
  )

  function getActivityMessage(activity: TeamActivity) {
    switch (activity.type) {
      case 'MEMBER_ADDED':
        return `${activity.user.name} added ${activity.data.memberName} to the team`
      case 'MEMBER_REMOVED':
        return `${activity.user.name} removed ${activity.data.memberName} from the team`
      case 'MEMBER_ROLE_UPDATED':
        return `${activity.user.name} updated ${activity.data.memberName}'s role to ${activity.data.role}`
      case 'SETTINGS_UPDATED':
        return `${activity.user.name} updated team settings`
      case 'TEAM_UPDATED':
        return `${activity.user.name} updated team details`
      case 'TEAM_DELETED':
        return `${activity.user.name} deleted the team`
      default:
        return `${activity.user.name} performed an action`
    }
  }

  if (isLoading) return null

  return (
    <div className="flow-root">
      <ul role="list" className="-mb-8">
        {activities.map((activity, activityIdx) => (
          <li key={activity.id}>
            <div className="relative pb-8">
              {activityIdx !== activities.length - 1 ? (
                <span
                  className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-gray-200"
                  aria-hidden="true"
                />
              ) : null}
              <div className="relative flex items-start space-x-3">
                <Avatar
                  data={{
                    type: activity.user.avatarType as any,
                    name: activity.user.name,
                    value: activity.user.name.substring(0, 2).toUpperCase(),
                    color: activity.user.avatarColor || '#000000'
                  }}
                  size="sm"
                />
                <div className="min-w-0 flex-1">
                  <div>
                    <div className="text-sm">
                      {getActivityMessage(activity)}
                    </div>
                    <p className="mt-0.5 text-sm text-gray-500">
                      {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
} 