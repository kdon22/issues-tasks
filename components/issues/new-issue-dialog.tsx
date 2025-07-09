"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Modal, ModalHeader, ModalBody, ModalFooter, ModalTitle } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PriorityBadge } from '@/components/ui/priority-badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

import { cn } from '@/lib/utils';
import { StatusSelector } from './status-selector';
import { TeamSelector } from './team-selector';
import { IssueTypePicker } from './issue-type-picker';
import { resourceHooks, useActionQuery } from '@/lib/hooks';
import { toast } from 'sonner';

// Schema for form validation
const newIssueSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().optional(),
  teamId: z.string().min(1, 'Team is required'),
  issueTypeId: z.string().min(1, 'Issue type is required'),
  stateId: z.string().optional(),
  priority: z.enum(['NO_PRIORITY', 'LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  assigneeId: z.string().optional(),
  projectId: z.string().optional(),
  estimate: z.number().optional(),
  dueDate: z.date().optional(),
});

type NewIssueForm = z.infer<typeof newIssueSchema>;

interface Team {
  id: string;
  name: string;
  identifier: string;
  avatarColor?: string;
  avatarEmoji?: string;
  avatarIcon?: string;
  avatarType?: 'INITIALS' | 'ICON' | 'EMOJI' | 'IMAGE';
}

interface IssueType {
  id: string;
  name: string;
  icon?: string | null;
  fieldSetId?: string | null;
}

interface State {
  id: string;
  name: string;
  color: string;
  type: 'UNSTARTED' | 'STARTED' | 'COMPLETED' | 'CANCELED';
  position: number;
}

interface User {
  id: string;
  name: string | null;
  email: string;
  avatarColor?: string;
}

interface Project {
  id: string;
  name: string;
  key: string;
  description?: string;
}

interface FieldConfiguration {
  fieldKey: string;
  showOnNewIssue: boolean;
  displayOrder: number;
}

interface NewIssueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceUrl: string;
  teams: Team[];
  issueTypes: IssueType[];
  members?: User[];
  projects?: Project[];
  onIssueCreated?: (issue: any) => void;
}

export function NewIssueDialog({
  open,
  onOpenChange,
  workspaceUrl,
  teams,
  issueTypes,
  members = [],
  projects = [],
  onIssueCreated,
}: NewIssueDialogProps) {
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [selectedIssueType, setSelectedIssueType] = useState<IssueType | null>(null);
  const [selectedState, setSelectedState] = useState<State | null>(null);
  const [availableStates, setAvailableStates] = useState<State[]>([]);
  const [fieldConfigurations, setFieldConfigurations] = useState<FieldConfiguration[]>([]);
  const [createMore, setCreateMore] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [popoverStates, setPopoverStates] = useState<{[key: string]: boolean}>({});
  
  // Use action hooks
  const { create: createIssue } = resourceHooks['issue'].useCreate();
  
  // Query for states based on selected issue type
  const { data: statesData } = useActionQuery<State[]>(
    `issueType.${selectedIssueType?.id}.states`,
    { enabled: !!selectedIssueType }
  );
  
  // Query for field configurations based on selected issue type's field set
  const { data: fieldConfigData } = useActionQuery<FieldConfiguration[]>(
    `fieldSet.${selectedIssueType?.fieldSetId}.configurations`,
    { enabled: !!selectedIssueType?.fieldSetId }
  );

  const form = useForm<NewIssueForm>({
    resolver: zodResolver(newIssueSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'MEDIUM',
    },
  });

  const togglePopover = (key: string, isOpen: boolean) => {
    setPopoverStates(prev => ({
      ...prev,
      [key]: isOpen
    }));
  };

  // Set default team (first team if available)
  useEffect(() => {
    if (teams.length > 0 && !selectedTeam) {
      const defaultTeam = teams[0];
      setSelectedTeam(defaultTeam);
      form.setValue('teamId', defaultTeam.id);
    }
  }, [teams, selectedTeam, form]);

  // Set default issue type (first issue type if available)
  useEffect(() => {
    if (issueTypes.length > 0 && !selectedIssueType) {
      const defaultIssueType = issueTypes[0];
      setSelectedIssueType(defaultIssueType);
      form.setValue('issueTypeId', defaultIssueType.id);
    }
  }, [issueTypes, selectedIssueType, form]);

  // Update states when data changes
  useEffect(() => {
    if (statesData) {
      setAvailableStates(statesData);
      
      // Set default state (first unstarted state)
      const defaultState = statesData.find((state: State) => state.type === 'UNSTARTED') || statesData[0];
      if (defaultState) {
        setSelectedState(defaultState);
        form.setValue('stateId', defaultState.id);
      }
    }
  }, [statesData, form]);

  // Update field configurations when data changes
  useEffect(() => {
    if (fieldConfigData) {
      setFieldConfigurations(fieldConfigData);
    } else if (selectedIssueType && !selectedIssueType.fieldSetId) {
      // No field set associated, clear configurations (will use defaults)
      setFieldConfigurations([]);
    }
  }, [fieldConfigData, selectedIssueType]);

  const handleTeamChange = (team: Team) => {
    setSelectedTeam(team);
    form.setValue('teamId', team.id);
  };

  const handleIssueTypeChange = (issueType: IssueType) => {
    setSelectedIssueType(issueType);
    form.setValue('issueTypeId', issueType.id);
    // Reset state when issue type changes
    setSelectedState(null);
    form.setValue('stateId', undefined);
  };

  const handleStateChange = (state: State) => {
    setSelectedState(state);
    form.setValue('stateId', state.id);
  };

  const handleSubmit = async (data: NewIssueForm) => {
    if (!selectedTeam || !selectedIssueType) return;

    setIsSubmitting(true);

    try {
      const result = await createIssue({
        ...data,
        teamId: selectedTeam.id,
        issueTypeId: selectedIssueType.id,
        stateId: selectedState?.id,
      });
      
      // Show success message
      toast.success('Issue created successfully');
      
      // Call success callback with the actual created issue data
      if (onIssueCreated && result) {
        onIssueCreated(result);
      }
      
      // Reset form if not creating more
      if (!createMore) {
        handleClose();
      } else {
        // Reset form but keep team and issue type selections
        form.reset({
          title: '',
          description: '',
          teamId: selectedTeam.id,
          issueTypeId: selectedIssueType.id,
          stateId: selectedState?.id,
          priority: 'MEDIUM',
        });
      }
    } catch (error) {
      console.error('Error creating issue:', error);
      toast.error('Failed to create issue');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    form.reset();
    setSelectedTeam(null);
    setSelectedIssueType(null);
    setSelectedState(null);
    setCreateMore(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      if (form.watch('title')?.trim()) {
        form.handleSubmit(handleSubmit)();
      }
    }
  };

  // Helper function to check if a field should be shown
  const shouldShowField = (fieldKey: string) => {
    return fieldConfigurations.some(config => config.fieldKey === fieldKey && config.showOnNewIssue);
  };

  // Get sorted fields for dynamic rendering
  const getSortedFields = () => {
    return fieldConfigurations
      .filter(config => config.showOnNewIssue)
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map(config => config.fieldKey);
  };

  // Render field components dynamically
  const renderField = (fieldKey: string) => {
    if (!shouldShowField(fieldKey)) return null;

    switch (fieldKey) {
      case 'state':
        return (
          <div key="state" className="flex flex-col gap-1">
            <span className="text-muted-foreground text-xs">Status</span>
            <StatusSelector
              states={availableStates}
              selectedState={selectedState}
              onSelect={handleStateChange}
              showBorder={true}
            />
          </div>
        );

      case 'priority':
        return (
          <div key="priority" className="flex flex-col gap-1">
            <span className="text-muted-foreground text-xs">Priority</span>
            <Select 
              onValueChange={(value) => form.setValue('priority', value as any)}
              value={form.watch('priority') || 'MEDIUM'}
            >
              <SelectTrigger variant="button" hideChevron>
                <SelectValue>
                  <PriorityBadge priority={form.watch('priority') || 'MEDIUM'} />
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {['NO_PRIORITY', 'LOW', 'MEDIUM', 'HIGH', 'URGENT'].map((priority) => (
                  <SelectItem key={priority} value={priority}>
                    <PriorityBadge priority={priority as any} />
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case 'assignee':
        const selectedAssignee = members.find(m => m.id === form.watch('assigneeId'));
        return (
          <div key="assignee" className="flex flex-col gap-1">
            <span className="text-muted-foreground text-xs">Assignee</span>
            <Select 
              onValueChange={(value) => form.setValue('assigneeId', value === 'unassigned' ? undefined : value)}
              value={form.watch('assigneeId') || 'unassigned'}
            >
              <SelectTrigger variant="button" hideChevron>
                <SelectValue>
                  {selectedAssignee ? (
                    <>
                      <Avatar className="w-4 h-4">
                        <AvatarFallback 
                          className="text-xs"
                          style={{ backgroundColor: selectedAssignee.avatarColor || '#6B7280' }}
                        >
                          {(selectedAssignee.name || selectedAssignee.email).charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span>{selectedAssignee.name || selectedAssignee.email}</span>
                    </>
                  ) : (
                    <span className="text-muted-foreground">Unassigned</span>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">
                  <span className="text-muted-foreground">Unassigned</span>
                </SelectItem>
                {members.map((member: User) => (
                  <SelectItem key={member.id} value={member.id}>
                    <div className="flex items-center gap-2">
                      <Avatar className="w-4 h-4">
                        <AvatarFallback 
                          className="text-xs"
                          style={{ backgroundColor: member.avatarColor || '#6B7280' }}
                        >
                          {(member.name || member.email).charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span>{member.name || member.email}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case 'project':
        const selectedProject = projects.find(p => p.id === form.watch('projectId'));
        return (
          <div key="project" className="flex flex-col gap-1">
            <span className="text-muted-foreground text-xs">Project</span>
            <Select 
              onValueChange={(value) => form.setValue('projectId', value === 'none' ? undefined : value)}
              value={form.watch('projectId') || 'none'}
            >
              <SelectTrigger variant="button" hideChevron>
                <SelectValue>
                  {selectedProject ? (
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{selectedProject.name}</span>
                      <span className="text-xs text-muted-foreground">{selectedProject.key}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">No project</span>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">
                  <span className="text-muted-foreground">No project</span>
                </SelectItem>
                {projects.map((project: Project) => (
                  <SelectItem key={project.id} value={project.id}>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{project.name}</span>
                      <span className="text-xs text-muted-foreground">{project.key}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case 'estimate':
        return (
          <div key="estimate" className="flex flex-col gap-1">
            <span className="text-muted-foreground text-xs">Estimate</span>
            <div className="flex items-center gap-1">
              <Input
                type="number"
                placeholder="0"
                className="w-12 h-7 px-2 border border-border/20 bg-muted/50 hover:bg-muted text-center"
                min="0"
                max="100"
                onChange={(e) => form.setValue('estimate', e.target.value ? parseInt(e.target.value) : undefined)}
                value={form.watch('estimate') || ''}
              />
              <span className="text-xs text-muted-foreground">pts</span>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      size="lg"
      className="max-w-3xl"
      onReset={handleClose}
      hideAutoTitle={true}
    >
      <ModalHeader className="border-b-0 pb-3">
        <div className="flex items-center gap-2">
          <ModalTitle className="font-medium">New issue</ModalTitle>
          <span className="text-muted-foreground">
            in {selectedTeam?.name}
          </span>
        </div>
      </ModalHeader>

      <ModalBody className="py-0">
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3" onKeyDown={handleKeyDown}>
          {/* Compact Team and Issue Type Row */}
          <div className="flex items-center gap-2">
            <TeamSelector
              teams={teams}
              selectedTeam={selectedTeam}
              onSelect={handleTeamChange}
              showBorder={true}
            />
            <IssueTypePicker
              issueTypes={issueTypes}
              selectedIssueType={selectedIssueType}
              onSelect={handleIssueTypeChange}
              showBorder={true}
            />
          </div>

          {/* Title Input */}
          <div>
            <Input
              {...form.register('title')}
              placeholder="Issue title"
              className="border-0 px-0 focus-visible:ring-0 shadow-none bg-transparent placeholder:text-muted-foreground h-7"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <Textarea
              {...form.register('description')}
              placeholder="Add a description..."
              className="border-0 px-0 focus-visible:ring-0 shadow-none bg-transparent placeholder:text-muted-foreground resize-none min-h-[60px]"
              rows={3}
            />
          </div>

          {/* Dynamic Fields Row - Only show after issue type is selected */}
          {selectedIssueType && getSortedFields().length > 0 && (
            <div className="flex items-start gap-3 py-2">
              {getSortedFields().map(fieldKey => renderField(fieldKey))}
            </div>
          )}
        </form>
      </ModalBody>

      <ModalFooter className="border-t-0 pt-2">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={createMore}
                onChange={(e) => setCreateMore(e.target.checked)}
                className="rounded border-muted-foreground/20 w-3 h-3"
              />
              Create more
            </label>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="text-xs text-muted-foreground mr-2">
              <kbd className="inline-flex items-center gap-1 rounded border bg-muted px-1.5 py-0.5 text-[10px] font-mono">
                ⌘↵
              </kbd>
              <span className="ml-1">to create</span>
            </div>
            
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              className="text-muted-foreground hover:text-foreground"
            >
              Cancel
            </Button>
            
            <Button
              type="submit"
              variant="primary"
              disabled={!form.watch('title')?.trim() || isSubmitting}
              onClick={form.handleSubmit(handleSubmit)}
            >
              {isSubmitting ? 'Creating...' : 'Create issue'}
            </Button>
          </div>
        </div>
      </ModalFooter>
    </Modal>
  );
} 