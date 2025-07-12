"use client";

import { useState } from 'react';
import { Plus, Users, Settings, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { TeamCard } from './team-card';
import { CreateTeamForm } from './create-team-form';

interface Team {
  id: string;
  name: string;
  identifier: string;
  description?: string;
  avatarType: 'INITIALS' | 'ICON' | 'EMOJI' | 'IMAGE';
  avatarIcon?: string;
  avatarColor?: string;
  avatarEmoji?: string;
  avatarImageUrl?: string;
  memberCount: number;
  issueCount: number;
  isPrivate: boolean;
  parentTeamId?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface TeamListProps {
  teams: Team[];
  isLoading?: boolean;
  onCreateTeam?: (teamData: any) => Promise<void>;
}

export function TeamList({ teams, isLoading = false, onCreateTeam }: TeamListProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleCreateTeam = async (teamData: any) => {
    await onCreateTeam?.(teamData);
    setShowCreateForm(false);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardHeader className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                <div className="space-y-1">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div className="flex-1"></div>
        {!showCreateForm && (
          <Button onClick={() => setShowCreateForm(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Create team
          </Button>
        )}
      </div>

      {/* Inline Create Form */}
      {showCreateForm && (
        <CreateTeamForm
          onCreateTeam={handleCreateTeam}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {/* Teams Grid */}
      {teams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map((team) => (
            <TeamCard key={team.id} team={team} />
          ))}
        </div>
      ) : !showCreateForm ? (
        <div className="text-center py-12">
          <Users className="w-12 h-12 mx-auto text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-semibold">No teams yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first team to get started with organizing your work
          </p>
          <Button onClick={() => setShowCreateForm(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Create your first team
          </Button>
        </div>
      ) : null}
    </div>
  );
} 