// Workspace Creation Page - Linear Clone
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { CreateWorkspaceForm } from '@/components/workspace/create-workspace-form';

export default async function CreateWorkspacePage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect('/auth/signin');
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Create Your Workspace
            </h1>
            <p className="text-gray-600">
              Let's get you started with your first workspace
            </p>
          </div>
          
          <CreateWorkspaceForm />
        </div>
      </div>
    </div>
  );
} 