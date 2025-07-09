import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { AuthError } from './auth-middleware';
import { WorkspaceError } from './workspace-middleware';

export function handleError(error: unknown): NextResponse {
  console.error('API Error:', error);

  if (error instanceof AuthError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.status }
    );
  }

  if (error instanceof WorkspaceError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.status }
    );
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: 'Validation error', details: error.errors },
      { status: 400 }
    );
  }

  // Generic error
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}

export async function withErrorHandling<T>(
  handler: () => Promise<T>
): Promise<T | NextResponse> {
  try {
    return await handler();
  } catch (error) {
    return handleError(error);
  }
} 