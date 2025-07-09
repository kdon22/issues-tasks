// Authentication Utilities - 
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export async function getCurrentUser() {
  const session = await auth();
  return session?.user;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth/signin");
  }
  return user;
}

export async function requireNoAuth() {
  const user = await getCurrentUser();
  if (user) {
    redirect("/");
  }
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// Get user's last accessed workspace for login redirects
export async function getUserLastAccessedWorkspace(userId: string): Promise<string | null> {
  try {
    const lastAccessedWorkspace = await prisma.workspaceMember.findFirst({
      where: {
        userId: userId,
      },
      orderBy: [
        {
          lastAccessedAt: 'desc',
        },
        {
          createdAt: 'desc', // Fallback to creation date if lastAccessedAt is null
        },
      ],
      include: {
        workspace: {
          select: {
            url: true,
          },
        },
      },
    });

    return lastAccessedWorkspace?.workspace.url || null;
  } catch (error) {
    console.error('Error getting last accessed workspace:', error);
    return null;
  }
}

// Update workspace access tracking
export async function updateWorkspaceAccess(userId: string, workspaceUrl: string): Promise<void> {
  try {
    await prisma.workspaceMember.updateMany({
      where: {
        userId: userId,
        workspace: {
          url: workspaceUrl,
        },
      },
      data: {
        lastAccessedAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Error updating workspace access:', error);
  }
} 