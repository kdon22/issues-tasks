// Empty State Component - 
import { Button } from '@/components/ui/button';
import { PlusCircle, Search } from 'lucide-react';

interface EmptyStateProps {
  workspaceUrl: string;
  hasFilters: boolean;
}

export function EmptyState({ workspaceUrl, hasFilters }: EmptyStateProps) {
  if (hasFilters) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto max-w-md">
          <Search className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900">
            No issues found
          </h3>
          <p className="mt-2 text-gray-600">
            Try adjusting your search or filters to find what you're looking for.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center py-12">
      <div className="mx-auto max-w-md">
        <PlusCircle className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-semibold text-gray-900">
          No issues yet
        </h3>
        <p className="mt-2 text-gray-600">
          Get started by creating your first issue to track work and collaborate with your team.
        </p>
        <div className="mt-6 space-y-3">
          <Button>
            Create your first issue
          </Button>
          <div className="text-sm text-gray-500">
            Or invite team members to start collaborating
          </div>
        </div>
      </div>
    </div>
  );
} 