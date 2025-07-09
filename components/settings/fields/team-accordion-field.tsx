import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight } from 'lucide-react';

export function TeamAccordionField({
  teams,
  expanded,
  onToggle,
  memberId
}: {
  teams: Array<{ id: string; name: string; role: string }>;
  expanded: boolean;
  onToggle: (id: string) => void;
  memberId: string;
}) {
  if (!teams || teams.length === 0) {
    return <span className="text-muted-foreground">No teams</span>;
  }
  return (
    <div className="space-y-1">
      <button
        onClick={() => onToggle(memberId)}
        className="flex items-center gap-1 text-sm hover:text-blue-600 transition-colors"
      >
        {expanded ? (
          <ChevronDown className="h-3 w-3" />
        ) : (
          <ChevronRight className="h-3 w-3" />
        )}
        <span>{teams.length} team{teams.length > 1 ? 's' : ''}</span>
      </button>
      {expanded && (
        <div className="ml-4 space-y-1">
          {teams.map(team => (
            <div key={team.id} className="flex items-center gap-2 text-sm">
              <span className="font-medium">{team.name}</span>
              <Badge variant="outline" className="text-xs">
                {team.role}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 