import { cookies } from 'next/headers'

interface User {
  id: string
  email: string
  name: string
}

export async function getCurrentUser(): Promise<User | null> {
  const sessionCookie = cookies().get('session')
  if (!sessionCookie?.value) return null
  
  try {
    return JSON.parse(sessionCookie.value) as User
  } catch {
    return null
  }
}

export async function getSession() {
  const user = await getCurrentUser()
  return user ? { user } : null
} 