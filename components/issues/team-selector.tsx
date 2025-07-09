"use client";

import React, { useState } from 'react';
import { Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getIconComponent } from '@/components/ui/icon-picker';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface Team {
  id: string;
  name: string;
  identifier: string;
  icon?: string; // Combined "iconName:color" format
}

interface TeamSelectorProps {
  teams: Team[];
  selectedTeam?: Team | null;
  onSelect: (team: Team) => void;
  placeholder?: string;
  className?: string;
  showBorder?: boolean;
}

export function TeamSelector({ 
  teams, 
  selectedTeam, 
  onSelect, 
  placeholder = "Select team",
  className,
  showBorder = false
}: TeamSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const renderTeamAvatar = (team: Team) => {
    // Parse the unified icon format "iconName:color"
    const [iconName, color] = team.icon?.split(':') || ['Users', '#6B7280'];
    const displayColor = color || '#6B7280';
    const IconComponent = getIconComponent(iconName || 'Users');
    
    return (
      <div 
        className="w-4 h-4 rounded-sm flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: displayColor }}
      >
        <IconComponent className="w-3 h-3 text-white" />
      </div>
    );
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-7 px-2 gap-2 hover:bg-muted text-left justify-start font-normal bg-muted/50",
            showBorder ? "border border-border/20" : "border-0",
            !selectedTeam && "text-muted-foreground",
            className
          )}
        >
          {selectedTeam ? (
            <>
              {renderTeamAvatar(selectedTeam)}
              <span className="font-medium">{selectedTeam.identifier}</span>
            </>
          ) : (
            <>
              <div className="w-4 h-4 rounded-sm flex items-center justify-center bg-muted">
                <Users className="w-3 h-3 text-muted-foreground" />
              </div>
              <span>{placeholder}</span>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="start">
        <div className="p-2">
          <div className="text-xs font-medium text-muted-foreground px-2 py-1 mb-1">
            Your teams
          </div>
          {teams.map((team) => {
            const isSelected = selectedTeam?.id === team.id;
            
            return (
              <button
                key={team.id}
                onClick={() => {
                  onSelect(team);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-2 py-2 rounded-md text-left hover:bg-muted transition-colors",
                  isSelected && "bg-accent"
                )}
              >
                {renderTeamAvatar(team)}
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">
                    {team.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {team.identifier}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
} 