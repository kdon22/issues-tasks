import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { Session } from 'next-auth';

export interface AuthContext {
  session: Session;
  userId: string;
}

export async function withAuth(request: NextRequest): Promise<AuthContext> {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new AuthError('Unauthorized', 401);
  }

  return {
    session,
    userId: session.user.id,
  };
}

export class AuthError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = 'AuthError';
  }
} 