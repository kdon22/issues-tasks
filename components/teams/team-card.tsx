"use client";

import { useState } from 'react';
// Icons imported below in the comprehensive icon set
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
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface Team {
  id: string;
  name: string;
  identifier: string;
  description?: string;
  icon?: string; // Combined "iconName:color" format
  memberCount: number;
  issueCount: number;
  isPrivate: boolean;
  parentTeamId?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface TeamCardProps {
  team: Team;
  onEdit?: (team: Team) => void;
  onDelete?: (team: Team) => void;
  onViewSettings?: (team: Team) => void;
}

import { Users, Settings, MoreHorizontal, Lock, Hash } from 'lucide-react';
import { IconField } from '@/components/settings/fields/icon-field';

export function TeamCard({ team, onEdit, onDelete, onViewSettings }: TeamCardProps) {
  const getTeamInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const renderTeamAvatar = () => {
    return (
      <div className="w-10 h-10 rounded-lg">
        <IconField value={team.icon || 'Users:#6366F1'} readOnly={true} />
      </div>
    );
  };

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1">
            {renderTeamAvatar()}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg font-semibold truncate">
                  {team.name}
                </CardTitle>
                {team.isPrivate && (
                  <Lock className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {team.identifier}
              </p>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onViewSettings?.(team)}>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit?.(team)}>
                Edit team
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete?.(team)}
                className="text-red-600 focus:text-red-600"
              >
                Delete team
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {team.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {team.description}
            </p>
          )}
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>{team.memberCount}</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Hash className="w-4 h-4" />
                <span>{team.issueCount}</span>
              </div>
            </div>
            
            <span className="text-xs text-muted-foreground">
              Updated {formatDistanceToNow(team.updatedAt, { addSuffix: true })}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 