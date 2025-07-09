// Middleware - 
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if this is a workspace route
  const workspaceMatch = pathname.match(/^\/workspace\/([^\/]+)/);
  
  if (workspaceMatch) {
    const workspaceUrl = workspaceMatch[1];
    
    // Note: Cannot use Prisma in Edge Runtime (middleware)
    // Workspace access tracking will be handled on the client side
    // or in API routes instead
    console.log('Accessing workspace:', workspaceUrl);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all workspace routes
    '/workspace/:path*',
  ],
}; 