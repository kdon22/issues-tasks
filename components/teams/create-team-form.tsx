"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { IconPicker } from '@/components/ui/icon-picker';
import { Plus, X, Upload, Hash, Clock, Users, Settings } from 'lucide-react';

interface CreateTeamFormProps {
  onCreateTeam?: (data: any) => Promise<void>;
  onCancel?: () => void;
}

const AVATAR_COLORS = [
  'bg-blue-500',
  'bg-green-500', 
  'bg-purple-500',
  'bg-red-500',
  'bg-yellow-500',
  'bg-indigo-500',
  'bg-pink-500',
  'bg-orange-500'
];

const TIMEZONES = [
  { value: 'UTC', label: 'UTC+0:00 - Coordinated Universal Time' },
  { value: 'America/New_York', label: 'GMT-5:00 - Eastern Time - New York' },
  { value: 'America/Chicago', label: 'GMT-6:00 - Central Time - Chicago' },
  { value: 'America/Denver', label: 'GMT-7:00 - Mountain Time - Denver' },
  { value: 'America/Los_Angeles', label: 'GMT-8:00 - Pacific Time - Los Angeles' },
  { value: 'America/Mexico_City', label: 'GMT-6:00 - Central Time - Mexico City' },
  { value: 'Europe/London', label: 'GMT+0:00 - Greenwich Mean Time - London' },
  { value: 'Europe/Paris', label: 'GMT+1:00 - Central European Time - Paris' },
  { value: 'Europe/Berlin', label: 'GMT+1:00 - Central European Time - Berlin' },
  { value: 'Asia/Tokyo', label: 'GMT+9:00 - Japan Standard Time - Tokyo' },
  { value: 'Asia/Shanghai', label: 'GMT+8:00 - China Standard Time - Shanghai' },
  { value: 'Asia/Mumbai', label: 'GMT+5:30 - India Standard Time - Mumbai' },
  { value: 'Australia/Sydney', label: 'GMT+10:00 - Australian Eastern Time - Sydney' },
];

const MOCK_TEAMS = [
  { id: '1', name: 'Engineering', identifier: 'ENG' },
  { id: '2', name: 'Design', identifier: 'DES' },
  { id: '3', name: 'Product', identifier: 'PRD' },
  { id: '4', name: 'Marketing', identifier: 'MKT' },
];

export function CreateTeamForm({ onCreateTeam, onCancel }: CreateTeamFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    identifier: '',
    avatarType: 'INITIALS' as 'INITIALS' | 'ICON' | 'EMOJI' | 'IMAGE',
    avatarIcon: '',
    avatarEmoji: '',
    avatarColor: AVATAR_COLORS[0],
    parentTeamId: 'none',
    copyFromTeamId: 'none',
    timezone: 'UTC',
    isPrivate: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNameChange = (name: string) => {
    const identifier = name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 3);
    
    setFormData(prev => ({ ...prev, name, identifier }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.identifier) return;

    setIsSubmitting(true);
    try {
      const teamData = {
        ...formData,
        parentTeamId: formData.parentTeamId === 'none' ? undefined : formData.parentTeamId,
        copyFromTeamId: formData.copyFromTeamId === 'none' ? undefined : formData.copyFromTeamId,
      };
      await onCreateTeam?.(teamData);
      setFormData({
        name: '',
        identifier: '',
        avatarType: 'INITIALS',
        avatarIcon: '',
        avatarEmoji: '',
        avatarColor: AVATAR_COLORS[0],
        parentTeamId: 'none',
        copyFromTeamId: 'none',
        timezone: 'UTC',
        isPrivate: false,
      });
      onCancel?.();
    } catch (error) {
      console.error('Failed to create team:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAvatarPreview = () => {
    const initials = formData.name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);

    return (
      <div className={`w-10 h-10 rounded-md ${formData.avatarColor} flex items-center justify-center text-white font-medium text-sm`}>
        {initials || 'T'}
      </div>
    );
  };

  return (
    <Card className="border-dashed">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-semibold">Create a new team</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Create a new team to manage separate cycles, workflows and notifications
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Team Icon */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Team icon</label>
            <IconPicker
              selectedIcon={formData.avatarIcon}
              selectedColor={formData.avatarColor}
              selectedEmoji={formData.avatarEmoji}
              selectedAvatarType={formData.avatarType}
              teamName={formData.name}
              onIconSelect={(icon) => setFormData(prev => ({ ...prev, avatarIcon: icon }))}
              onColorSelect={(color) => setFormData(prev => ({ ...prev, avatarColor: color }))}
              onEmojiSelect={(emoji) => setFormData(prev => ({ ...prev, avatarEmoji: emoji }))}
              onAvatarTypeSelect={(type) => setFormData(prev => ({ ...prev, avatarType: type }))}
            />
          </div>

          {/* Team Name and Identifier */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Team name</label>
              <Input
                placeholder="e.g. Engineering"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Identifier</label>
              <div className="text-xs text-muted-foreground mb-1">
                Used to identify issues from this team (e.g. ENG-123)
              </div>
              <Input
                placeholder="e.g. ENG"
                value={formData.identifier}
                onChange={(e) => setFormData(prev => ({ ...prev, identifier: e.target.value.toUpperCase() }))}
                required
              />
            </div>
          </div>

          {/* Team Hierarchy */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Team hierarchy</label>
            <div className="text-xs text-muted-foreground mb-3">
              Teams can be nested to reflect your team structure and to share workflows and settings
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Parent team</span>
              </div>
              <div className="flex items-center gap-2">
                <Select value={formData.parentTeamId} onValueChange={(value) => setFormData(prev => ({ ...prev, parentTeamId: value }))}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No parent</SelectItem>
                    {MOCK_TEAMS.map(team => (
                      <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-xs text-muted-foreground">Available on Business</span>
              </div>
            </div>
          </div>

          {/* Copy Settings */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Copy settings from existing team</label>
            <div className="text-xs text-muted-foreground mb-3">
              You can choose to copy the settings of an existing team for your newly created team. All settings 
              including workflow and cycle settings are copied, but Slack notification settings and team members 
              won't be copied.
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Settings className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Copy from team</span>
              </div>
              <Select value={formData.copyFromTeamId} onValueChange={(value) => setFormData(prev => ({ ...prev, copyFromTeamId: value }))}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Don't copy</SelectItem>
                  {MOCK_TEAMS.map(team => (
                    <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Timezone */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Timezone</label>
            <div className="text-xs text-muted-foreground mb-3">
              The timezone should be set as the location where most of your team members reside. All other times 
              referenced by the team will be relative to this timezone setting. For example, if the team uses cycles, 
              each cycle will start at midnight in the specified timezone.
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Timezone</span>
              </div>
              <Select value={formData.timezone} onValueChange={(value) => setFormData(prev => ({ ...prev, timezone: value }))}>
                <SelectTrigger className="w-80">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map(tz => (
                    <SelectItem key={tz.value} value={tz.value}>{tz.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Privacy */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Make team private</label>
            <div className="text-xs text-muted-foreground mb-3">
              Private teams and their issues are only visible to members of the team and admins. Only admins and 
              team owners can add new users to a private team. Public teams and their issues are visible to anyone 
              in the workspace.
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Hash className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Private team</span>
              </div>
              <div className="flex items-center gap-2">
                <Switch 
                  checked={formData.isPrivate} 
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPrivate: checked }))}
                />
                <span className="text-xs text-muted-foreground">Available on Business</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create team
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 