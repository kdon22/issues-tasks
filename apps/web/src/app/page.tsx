import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/infrastructure/auth/config'
import { prisma } from '@/infrastructure/db/prisma'

export default async function HomePage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/login')
  }

  // Get user's default workspace
  const defaultWorkspace = await prisma.workspaceMember.findFirst({
    where: { userId: session.user.id },
    select: { workspace: { select: { url: true } } },
    orderBy: { lastAccessedAt: 'desc' }
  })

  if (defaultWorkspace?.workspace) {
    redirect(`/${defaultWorkspace.workspace.url}`)
  }

  // If no workspaces, redirect to create one
  redirect('/workspace/new')
}
