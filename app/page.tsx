"use client";

import { AppShell } from '@/components/layout/app-shell';
import { Sidebar } from '@/components/layout/sidebar';
import { PageLayout } from '@/components/layout/page-layout';
import { IssueCard } from '@/components/ui/issue-card';
import { PriorityBadge } from '@/components/ui/priority-badge';
import { StateBadge } from '@/components/ui/state-badge';
import { UserAvatar } from '@/components/ui/user-avatar';
import { UserMenu } from '@/components/auth/user-menu';
import { ApiExample } from '@/components/examples/api-example';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { auth } from '@/lib/auth';
import { getUserLastAccessedWorkspace } from '@/lib/auth-utils';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  const session = await auth();
  
  if (session?.user?.id) {
    // User is logged in, redirect to their last accessed workspace
    const workspaceUrl = await getUserLastAccessedWorkspace(session.user.id);
    
    if (workspaceUrl) {
      redirect(`/workspace/${workspaceUrl}`);
    } else {
      // User has no workspaces, redirect to a workspace selection or creation page
      redirect('/workspace/create');
    }
  }
  
  // User is not logged in, show landing page
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Linear Clone
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            The issue tracking tool you'll actually want to use. 
            Built for modern teams who move fast and ship often.
          </p>
          <div className="space-x-4">
            <a
              href="/auth/signin"
              className="bg-orange text-white px-8 py-3 rounded-lg font-medium hover:bg-orange/90 transition-colors"
            >
              Sign In
            </a>
            <a
              href="/auth/signin"
              className="bg-white text-orange px-8 py-3 rounded-lg font-medium border border-orange hover:bg-orange-50 transition-colors"
            >
              Get Started
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
