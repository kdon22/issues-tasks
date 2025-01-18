import { getServerSession } from 'next-auth'
import { authConfig } from './config'
import type { Session } from 'next-auth'

export async function getSession() {
  return await getServerSession(authConfig) as Session | null
}

export async function requireSession() {
  const session = await getSession()
  if (!session) {
    throw new Error('Unauthorized')
  }
  return session
}

export async function requireWorkspaceSession() {
  const session = await requireSession()
  if (!session.user.defaultWorkspace) {
    throw new Error('No workspace selected')
  }
  return session
} 