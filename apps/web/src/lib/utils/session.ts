import type { Session } from '@/lib/types/session'

export function validateSession(data: unknown): data is Session {
  if (!data || typeof data !== 'object') return false
  
  const session = data as Session
  return (
    typeof session.user?.id === 'string' &&
    typeof session.user?.email === 'string' &&
    (session.user?.name === null || typeof session.user?.name === 'string') &&
    typeof session.workspace?.id === 'string' &&
    typeof session.workspace?.url === 'string'
  )
} 