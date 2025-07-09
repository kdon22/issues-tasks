"use client";

import { useState } from 'react';
import { ChevronRight, Copy, MoreHorizontal, Star, Flag } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface IssueParent {
  id: string;
  title: string;
  identifier: string;
  number: number;
  parent?: {
    id: string;
    title: string;
    identifier: string;
    number: number;
  } | null;
}

interface Issue {
  id: string;
  title: string;
  identifier: string;
  number: number;
  parent?: IssueParent | null;
}

interface IssueDetailHeaderProps {
  issue: Issue;
  workspaceUrl: string;
  className?: string;
}

export function IssueDetailHeader({ 
  issue, 
  workspaceUrl, 
  className 
}: IssueDetailHeaderProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [isFlagged, setIsFlagged] = useState(false);

  const handleCopyUrl = async () => {
    try {
      const url = `${window.location.origin}/workspaces/${workspaceUrl}/issues/${issue.id}`;
      await navigator.clipboard.writeText(url);

    } catch (error) {
      toast.error('Failed to copy URL');
    }
  };

  const handleToggleFavorite = () => {
    setIsFavorited(!isFavorited);

  };

  const handleToggleFlag = () => {
    setIsFlagged(!isFlagged);

  };

  // Build breadcrumb chain
  const breadcrumbs = [];
  
  // Add grandparent if exists
  if (issue.parent?.parent) {
    breadcrumbs.push({
      id: issue.parent.parent.id,
      title: issue.parent.parent.title,
      identifier: issue.parent.parent.identifier,
      number: issue.parent.parent.number,
    });
  }
  
  // Add parent if exists
  if (issue.parent) {
    breadcrumbs.push({
      id: issue.parent.id,
      title: issue.parent.title,
      identifier: issue.parent.identifier,
      number: issue.parent.number,
    });
  }

  return (
    <header className={cn(
      'flex items-center justify-between h-12 px-4 border-b border-border bg-gray-50',
      className
    )}>
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-1 min-w-0">
          {breadcrumbs.map((breadcrumb, index) => (
            <div key={breadcrumb.id} className="flex items-center gap-1 min-w-0">
              <Link 
                href={`/workspaces/${workspaceUrl}/issues/${breadcrumb.id}`}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors min-w-0"
              >
                <span className="font-mono text-xs">{breadcrumb.identifier}</span>
                <span className="truncate max-w-32">{breadcrumb.title}</span>
              </Link>
              <ChevronRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
            </div>
          ))}
          
          {/* Current Issue */}
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-mono text-sm font-semibold">{issue.identifier}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 ml-4">
        {/* Favorite Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggleFavorite}
          className="h-8 w-8 p-0"
        >
          <Star className={cn(
            "h-4 w-4",
            isFavorited ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
          )} />
        </Button>

        {/* Flag Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggleFlag}
          className="h-8 w-8 p-0"
        >
          <Flag className={cn(
            "h-4 w-4",
            isFlagged ? "fill-red-400 text-red-400" : "text-muted-foreground"
          )} />
        </Button>

        {/* Copy URL Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopyUrl}
          className="h-8 w-8 p-0"
        >
          <Copy className="h-4 w-4" />
        </Button>

        {/* More Actions Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleCopyUrl}>
              <Copy className="h-4 w-4 mr-2" />
              Copy issue URL
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleToggleFavorite}>
              <Star className="h-4 w-4 mr-2" />
              {isFavorited ? 'Remove from favorites' : 'Add to favorites'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleToggleFlag}>
              <Flag className="h-4 w-4 mr-2" />
              {isFlagged ? 'Remove flag' : 'Add flag'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
} 