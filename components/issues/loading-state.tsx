// Loading State Component - 
import { Skeleton } from '@/components/ui/skeleton';

export function LoadingState() {
  return (
    <div className="space-y-2">
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
        {/* Generate multiple skeleton rows */}
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-4 p-4 border-b border-gray-100 last:border-b-0"
          >
            {/* Issue Identifier */}
            <div className="flex-shrink-0 w-20">
              <Skeleton className="h-4 w-16" />
            </div>

            {/* Priority */}
            <div className="flex-shrink-0">
              <Skeleton className="h-6 w-6 rounded-full" />
            </div>

            {/* Status */}
            <div className="flex-shrink-0">
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>

            {/* Title */}
            <div className="flex-1 min-w-0">
              <Skeleton className="h-4 w-full max-w-md" />
            </div>

            {/* Project */}
            <div className="flex-shrink-0 hidden md:block">
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-3 rounded" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>

            {/* Assignee */}
            <div className="flex-shrink-0">
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-4 w-16 hidden md:block" />
              </div>
            </div>

            {/* Created date */}
            <div className="flex-shrink-0 hidden lg:block">
              <Skeleton className="h-4 w-16" />
            </div>

            {/* Actions */}
            <div className="flex-shrink-0">
              <Skeleton className="h-6 w-6 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 