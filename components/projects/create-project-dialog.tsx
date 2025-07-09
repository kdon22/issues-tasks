"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MultiSelect } from '@/components/ui/multi-select';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Users, 
  Calendar, 
  Target, 
  Tag, 
  CircleDot, 
  Plus,
  ChevronRight,
  Building2
} from 'lucide-react';
import { IconPicker, getIconComponent } from '@/components/ui/icon-picker';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useTeams, useMembers } from '@/lib/hooks';
import { toast } from 'sonner';

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceUrl: string;
  onProjectCreated?: (project: any) => void;
}

interface ProjectFormData {
  name: string;
  summary: string;
  description: string;
  identifier: string;
  teamIds: string[]; // Multiple teams for project sharing
  leadUserId: string;
  startDate: string;
  targetDate: string;
  // Icon settings
  iconType: 'INITIALS' | 'ICON' | 'EMOJI' | 'IMAGE';
  iconName?: string;
  iconEmoji?: string;
  iconColor: string;
}

interface PropertyBadgeProps {
  icon: React.ElementType;
  label: string;
  value?: string;
  placeholder?: string;
  onClick?: () => void;
  variant?: 'default' | 'filled';
}

function PropertyBadge({ 
  icon: Icon, 
  label, 
  value, 
  placeholder, 
  onClick, 
  variant = 'default' 
}: PropertyBadgeProps) {
  const hasValue = value && value !== placeholder;
  
  return (
    <Button
      variant={
        variant === 'filled' 
          ? "property-active" 
          : hasValue 
            ? "property-filled" 
            : "property"
      }
      size="sm"
      onClick={onClick}
      className="gap-1.5"
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
      {hasValue && (
        <>
          <span className="text-gray-400">·</span>
          <span className="text-gray-700">{value}</span>
        </>
      )}
    </Button>
  );
}

interface Team {
  id: string;
  name: string;
  identifier: string;
  color?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
}

export function CreateProjectDialog({ 
  open, 
  onOpenChange, 
  workspaceUrl,
  onProjectCreated 
}: CreateProjectDialogProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    summary: '',
    description: '',
    identifier: '',
    teamIds: [],
    leadUserId: '',
    startDate: '',
    targetDate: '',
    iconType: 'INITIALS',
    iconName: undefined,
    iconEmoji: undefined,
    iconColor: '#6366F1'
  });

  // const { state: teamsState } = useCachedResource<Team>({
  //   resource: 'teams',
  //   cacheKey: 'teams',
  //   optimisticUpdates: true,
  //   showToasts: true,
  //   autoSync: true,
  //   refreshInterval: 300000
  // });

  // const { state: usersState } = useCachedResource<User>({
  //   resource: 'users',
  //   cacheKey: 'users',
  //   optimisticUpdates: false,
  //   showToasts: false,
  //   autoSync: false,
  //   refreshInterval: 600000
  // });

  // Extract items from state with proper typing
  const { data: teams = [], isLoading: loadingTeams } = useTeams();
  const { data: users = [], isLoading: loadingUsers } = useMembers();

  // Transform teams for MultiSelect
  const teamOptions = teams.map((team: Team) => ({
    value: team.id,
    label: team.name,
    icon: Building2
  }));

  const selectedTeams = teams.filter((team: Team) => formData.teamIds.includes(team.id));
  const leadUser = users.find((u: User) => u.id === formData.leadUserId);

  // Auto-generate identifier from name for icon
  const projectInitials = formData.name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'PR';

  // Auto-fill identifier based on name (first 3 letters)
  useEffect(() => {
    if (formData.name) {
      const autoIdentifier = formData.name
        .replace(/[^a-zA-Z0-9]/g, '') // Remove non-alphanumeric
        .toUpperCase()
        .slice(0, 3);
      
      // Only auto-fill if identifier is empty or hasn't been manually edited
      if (!formData.identifier || formData.identifier === autoIdentifier.slice(0, formData.identifier.length)) {
        setFormData(prev => ({ ...prev, identifier: autoIdentifier }));
      }
    }
  }, [formData.name]);

  // Validation logic
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Project name is required';
    }
    
    if (formData.teamIds.length === 0) {
      errors.teams = 'At least one team must be selected';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Check if form is valid (for button state)
  const isFormValid = Boolean(formData.name.trim()) && formData.teamIds.length > 0;

  // Update validation on form changes
  useEffect(() => {
    if (hasAttemptedSubmit) {
      validateForm();
    }
  }, [formData.name, formData.teamIds, hasAttemptedSubmit]);

  // Reset form and validation function
  const resetForm = () => {
    setFormData({
      name: '',
      summary: '',
      description: '',
      identifier: '',
      teamIds: [],
      leadUserId: '',
      startDate: '',
      targetDate: '',
      iconType: 'INITIALS',
      iconName: undefined,
      iconEmoji: undefined,
      iconColor: '#6366F1'
    });
    setValidationErrors({});
    setHasAttemptedSubmit(false);
  };

  const handleSubmit = async () => {
    setHasAttemptedSubmit(true);
    
    if (!validateForm()) {
      toast.error('Please fix the validation errors before submitting');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create the project payload with only required fields and non-empty optionals
      const payload: any = {
        name: formData.name,
        teamId: formData.teamIds[0], // Primary team is required
        identifier: formData.identifier, // Always include identifier
      };

      // Add optional fields only if they have values
      if (formData.description?.trim()) {
        payload.description = formData.description;
      }
      if (formData.summary?.trim()) {
        payload.summary = formData.summary;
      }
      if (formData.iconColor) {
        payload.color = formData.iconColor;
      }
      if (formData.leadUserId) {
        payload.leadUserId = formData.leadUserId;
      }
      if (formData.startDate) {
        payload.startDate = formData.startDate;
      }
      if (formData.targetDate) {
        payload.targetDate = formData.targetDate;
      }

      // Create the project
      const response = await fetch(`/api/workspaces/${workspaceUrl}/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to create project');
      }

      const { data: project } = await response.json();

      // Create team associations for all selected teams
      if (formData.teamIds.length > 0) {
        const projectTeamPromises = formData.teamIds.map((teamId, index) =>
          fetch(`/api/workspaces/${workspaceUrl}/project-teams`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              projectId: project.id,
              teamId,
              role: index === 0 ? 'LEAD' : 'MEMBER' // First team is lead
            })
          })
        );

        await Promise.all(projectTeamPromises);
      }

      
      onOpenChange(false);
      // Form reset is handled automatically by Modal's onReset prop

      // Callback or navigation
      if (onProjectCreated) {
        onProjectCreated(project);
      } else {
        router.push(`/workspaces/${workspaceUrl}/projects/${project.id}`);
      }
    } catch (error) {
      console.error('Failed to create project:', error);
      toast.error('Failed to create project');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal 
      open={open} 
      onOpenChange={onOpenChange}
      size="5xl"
      onReset={resetForm}
    >
      <Modal.Header onClose={() => onOpenChange(false)}>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            {/* Team Multi-Select Breadcrumb */}
            <MultiSelect
              options={teamOptions}
              selectedValues={formData.teamIds}
              onSelectionChange={(teamIds) => setFormData(prev => ({ ...prev, teamIds }))}
              placeholder="Select teams"
              maxDisplayed={1}
              className={cn(
                "w-auto min-w-[120px]",
                validationErrors.teams && "border-red-500"
              )}
            />
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <Modal.Title className="font-medium">New project</Modal.Title>
          </div>
          {validationErrors.teams && (
            <p className="text-red-500 text-sm">{validationErrors.teams}</p>
          )}
        </div>
      </Modal.Header>

      <Modal.Body>
        <div className="space-y-8">
          {/* Icon and Project Name */}
          <div className="flex items-start gap-4">
            <Popover>
              <PopoverTrigger asChild>
                <button 
                  className="w-12 h-12 rounded-lg flex items-center justify-center border border-gray-200 hover:bg-gray-50 transition-colors"
                  style={{ backgroundColor: formData.iconType === 'INITIALS' ? formData.iconColor : 'transparent' }}
                >
                  {formData.iconType === 'INITIALS' && (
                    <span className="text-white font-bold text-sm">
                      {projectInitials}
                    </span>
                  )}
                  {formData.iconType === 'ICON' && formData.iconName && (() => {
                    const IconComponent = getIconComponent(formData.iconName);
                    return <IconComponent className="w-6 h-6" style={{ color: formData.iconColor }} />;
                  })()}
                  {formData.iconType === 'EMOJI' && (
                    <span className="text-xl">
                      {formData.iconEmoji || '🚀'}
                    </span>
                  )}
                  {formData.iconType === 'IMAGE' && (
                    <span className="text-white font-bold text-sm">
                      {projectInitials}
                    </span>
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent 
                className="w-auto p-4" 
                align="start" 
                side="bottom" 
                sideOffset={4}
              >
                <IconPicker
                  selectedIcon={formData.iconName}
                  selectedColor={formData.iconColor}
                  selectedEmoji={formData.iconEmoji}
                  selectedAvatarType={formData.iconType}
                  teamName={formData.name}
                  onIconSelect={(iconName) => setFormData(prev => ({ ...prev, iconName, iconType: 'ICON' }))}
                  onColorSelect={(color) => setFormData(prev => ({ ...prev, iconColor: color }))}
                  onEmojiSelect={(emoji) => setFormData(prev => ({ ...prev, iconEmoji: emoji, iconType: 'EMOJI' }))}
                  onAvatarTypeSelect={(type) => setFormData(prev => ({ ...prev, iconType: type }))}
                />
              </PopoverContent>
            </Popover>
            <div className="flex-1 space-y-2">
              <div>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Project name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      noBorder
                      placeholderWeight="medium"
                      className={cn(
                        "text-xl font-bold p-0 h-12",
                        validationErrors.name && "border-red-500 border-l-2 pl-2"
                      )}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">ID:</span>
                    <Input
                      placeholder="PRJ"
                      value={formData.identifier}
                      onChange={(e) => setFormData(prev => ({ ...prev, identifier: e.target.value.toUpperCase() }))}
                      noBorder
                      placeholderWeight="medium"
                      className="text-gray-600 p-0 h-12 w-20 font-mono"
                      maxLength={10}
                    />
                  </div>
                </div>
                {validationErrors.name && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.name}</p>
                )}
              </div>
              <Input
                placeholder="Add a short summary..."
                value={formData.summary}
                onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                noBorder
                placeholderWeight="medium"
                className="text-gray-600 p-0 h-8"
              />
            </div>
          </div>

          {/* Property Badges */}
          <div className="flex flex-wrap gap-3">
            <PropertyBadge
              icon={CircleDot}
              label="Backlog"
              variant="filled"
            />
            <PropertyBadge
              icon={Tag}
              label="No priority"
            />
            <PropertyBadge
              icon={User}
              label="Lead"
              value={leadUser?.name}
              placeholder="Select lead"
            />
            <PropertyBadge
              icon={Users}
              label="Members"
              value={selectedTeams.length > 0 ? `${selectedTeams.length} team${selectedTeams.length > 1 ? 's' : ''}` : undefined}
              placeholder="Select teams"
            />
            <PropertyBadge
              icon={Calendar}
              label="Start"
              placeholder="Set start date"
            />
            <PropertyBadge
              icon={Target}
              label="Target"
              placeholder="Set target date"
            />
            <PropertyBadge
              icon={Target}
              label="Initiatives"
              placeholder="Add to initiative"
            />
            <PropertyBadge
              icon={Tag}
              label="Labels"
              placeholder="Add labels"
            />
            <PropertyBadge
              icon={CircleDot}
              label="Dependencies"
              placeholder="Add dependencies"
            />
          </div>

          {/* Description */}
          <div>
            <Textarea
              placeholder="Write a description, a project brief, or collect ideas..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              noBorder
              placeholderWeight="medium"
              className="min-h-[200px] p-0 resize-none"
            />
          </div>

          <Separator />

          {/* Milestones */}
          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Milestones</h3>
              <Button variant="ghost" size="sm" className="text-gray-500">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer justify="end">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onOpenChange(false)}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button 
          variant="primary" 
          size="sm"
          onClick={handleSubmit}
          isValid={isFormValid}
          isPending={isSubmitting}
        >
          {isSubmitting ? 'Creating...' : 'Create project'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
