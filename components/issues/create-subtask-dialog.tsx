"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Modal, ModalHeader, ModalBody, ModalFooter, ModalTitle } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PriorityBadge } from '@/components/ui/priority-badge';
import { StateBadge } from '@/components/ui/state-badge';
import { cn } from '@/lib/utils';
import { useCreateIssue, useActionQuery } from '@/lib/hooks';
import { toast } from 'sonner';
import { IssueTypePicker } from './issue-type-picker';
import { StatusSelector } from './status-selector';

// Validation schema for subtask creation (only title required)
const createSubtaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().optional(),
  priority: z.enum(['NO_PRIORITY', 'LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM').optional(),
  assigneeId: z.string().optional(),
  stateId: z.string().optional(), // Optional - will use sensible defaults
  issueTypeId: z.string().optional(), // Optional - will use sensible defaults
  projectId: z.string().optional(),
  estimate: z.number().min(0).optional(),
});

type CreateSubtaskForm = z.infer<typeof createSubtaskSchema>;

// Types based on existing codebase patterns
interface User {
  id: string;
  name: string | null;
  email: string;
}

interface State {
  id: string;
  name: string;
  color: string;
  type: string;
}

interface IssueType {
  id: string;
  name: string;
  icon?: string | null;
  description?: string | null;
  fieldSetId?: string | null;
}

interface Project {
  id: string;
  name: string;
  identifier: string;
  color?: string | null;
}

interface ParentIssue {
  id: string;
  title: string;
  identifier: string;
  teamId: string;
  projectId?: string | null;
}

interface CreateSubtaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentIssue: ParentIssue;
  workspaceUrl: string;
  // Available options for form fields
  issueTypes: IssueType[];
  states: State[];
  members: User[];
  projects: Project[];
  // Callback for successful creation
  onSubtaskCreated?: (subtask: any) => void;
}

export function CreateSubtaskDialog({ 
  open, 
  onOpenChange, 
  parentIssue,
  workspaceUrl,
  issueTypes,
  states,
  members,
  projects,
  onSubtaskCreated
}: CreateSubtaskDialogProps) {
  const [selectedIssueType, setSelectedIssueType] = useState<IssueType | null>(null);
  const [availableStates, setAvailableStates] = useState<State[]>(states);
  const [fieldConfigurations, setFieldConfigurations] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Use action hooks
  const { createIssue } = useCreateIssue();
  
  // Query for states based on selected issue type
  const { data: statesData } = useActionQuery<State[]>(
    `issueType.${selectedIssueType?.id}.states`,
    { enabled: !!selectedIssueType }
  );
  
  // Query for field configurations based on selected issue type's field set
  const { data: fieldConfigData } = useActionQuery<any[]>(
    `fieldSet.${selectedIssueType?.fieldSetId}.configurations`,
    { enabled: !!selectedIssueType?.fieldSetId }
  );

  const form = useForm<CreateSubtaskForm>({
    resolver: zodResolver(createSubtaskSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'MEDIUM',
      issueTypeId: undefined,
      stateId: undefined,
      assigneeId: undefined,
      projectId: parentIssue.projectId || undefined,
      estimate: undefined,
    },
  });

  // Update states when data changes
  useEffect(() => {
    if (statesData) {
      setAvailableStates(statesData);
      
      // Reset state selection when issue type changes
      form.setValue('stateId', undefined);
      
      // Set new default state
      const defaultState = statesData.find((state: State) => state.type === 'UNSTARTED') || statesData[0];
      if (defaultState) {
        form.setValue('stateId', defaultState.id);
      }
    } else {
      setAvailableStates(states);
    }
  }, [statesData, states, form]);

  // Update field configurations when data changes
  useEffect(() => {
    if (fieldConfigData) {
      setFieldConfigurations(fieldConfigData);
    } else if (selectedIssueType && !selectedIssueType.fieldSetId) {
      // No field set associated, clear configurations (will use defaults)
      setFieldConfigurations([]);
    }
  }, [fieldConfigData, selectedIssueType]);

  const onSubmit = async (data: CreateSubtaskForm) => {
    setIsSubmitting(true);
    
    try {
      const result = await createIssue({
        ...data,
        parentId: parentIssue.id,
        teamId: parentIssue.teamId,
        // Convert empty strings to null for optional fields
        assigneeId: data.assigneeId || null,
        projectId: data.projectId || null,
        stateId: data.stateId || null, // Backend will provide default if null
        issueTypeId: data.issueTypeId || null, // Backend will provide default if null
        estimate: data.estimate || null,
      });
      
      // Show success message
      toast.success('Subtask created successfully');
      
      // Call success callback with the actual created subtask data
      if (onSubtaskCreated && result) {
        onSubtaskCreated(result);
      }
      
      // Close dialog and reset form
      onOpenChange(false);
      form.reset();
      setSelectedIssueType(null);
      
    } catch (error) {
      console.error('Error creating subtask:', error);
      toast.error('Failed to create subtask');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    form.reset();
    setSelectedIssueType(null);
  };

  // Helper function to check if a field should be shown
  const shouldShowField = (fieldKey: string) => {
    if (fieldConfigurations.length === 0) {
      // Fallback to showing default fields if no configuration
      return ['priority', 'assignee', 'project', 'estimate'].includes(fieldKey);
    }
    return fieldConfigurations.some(config => config.fieldKey === fieldKey && config.showOnNewIssue);
  };

  // Get sorted fields for dynamic rendering
  const getSortedFields = () => {
    if (fieldConfigurations.length === 0) {
      return ['priority', 'assignee', 'project', 'estimate'];
    }
    return fieldConfigurations
      .filter(config => config.showOnNewIssue)
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map(config => config.fieldKey);
  };

  // Render field components dynamically
  const renderField = (fieldKey: string) => {
    if (!shouldShowField(fieldKey)) return null;

    switch (fieldKey) {
      case 'priority':
        return (
          <FormField
            key="priority"
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Priority</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value || 'MEDIUM'}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="NO_PRIORITY">
                      <PriorityBadge priority="NO_PRIORITY" />
                    </SelectItem>
                    <SelectItem value="LOW">
                      <PriorityBadge priority="LOW" />
                    </SelectItem>
                    <SelectItem value="MEDIUM">
                      <PriorityBadge priority="MEDIUM" />
                    </SelectItem>
                    <SelectItem value="HIGH">
                      <PriorityBadge priority="HIGH" />
                    </SelectItem>
                    <SelectItem value="URGENT">
                      <PriorityBadge priority="URGENT" />
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case 'assignee':
        return (
          <FormField
            key="assignee"
            control={form.control}
            name="assigneeId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Assignee <span className="text-xs text-gray-500">(optional)</span></FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ''}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Unassigned" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">
                      <span className="text-gray-500">Unassigned</span>
                    </SelectItem>
                    {members.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium">
                            {(member.name || member.email).charAt(0).toUpperCase()}
                          </div>
                                                      <span>{member.name || member.email}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case 'project':
        return (
          <FormField
            key="project"
            control={form.control}
            name="projectId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ''}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">
                      <span className="text-gray-500">No project</span>
                    </SelectItem>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: project.color || '#6366F1' }}
                          />
                          <span>{project.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case 'estimate':
        return (
          <FormField
            key="estimate"
            control={form.control}
            name="estimate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estimate (Story Points)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Enter estimate..."
                    {...field}
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                    className="bg-white dark:bg-gray-800"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      default:
        return null;
    }
  };


  
  return (
    <Modal open={open} onOpenChange={handleClose} className="sm:max-w-[600px]">
      {/* Header */}
      <ModalHeader>
        <ModalTitle className="flex items-center gap-2">
          <Plus className="w-5 h-5 text-blue-600" />
          Create Subtask
        </ModalTitle>
        <p className="text-sm text-muted-foreground">
          Creating a subtask for <span className="font-medium">{parentIssue.identifier}</span>
        </p>
      </ModalHeader>

      <ModalBody className="max-h-[60vh] overflow-y-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Issue Type Selection - Optional, will use sensible defaults */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Issue Type <span className="text-xs text-gray-500">(optional)</span></label>
              <IssueTypePicker 
                issueTypes={issueTypes}
                selectedIssueType={selectedIssueType}
                onSelect={(issueType) => {
                  setSelectedIssueType(issueType);
                  form.setValue('issueTypeId', issueType.id);
                }}
                placeholder="Auto-select subtask type"
              />
            </div>

            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter subtask title..."
                      {...field}
                      className="bg-white dark:bg-gray-800"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the subtask..."
                      rows={3}
                      {...field}
                      className="bg-white dark:bg-gray-800 resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* State Row - Always shown first */}
            <FormField
              control={form.control}
              name="stateId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State <span className="text-xs text-gray-500">(optional)</span></FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ''}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Auto-select default state" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableStates.map((state) => (
                        <SelectItem key={state.id} value={state.id}>
                          <div className="flex items-center gap-2">
                            <StateBadge state={state.type as any} />
                            <span>{state.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Dynamic Fields based on Field Set Configuration */}
            <div className="space-y-6">
              {getSortedFields().map(fieldKey => renderField(fieldKey))}
            </div>
          </form>
        </Form>
      </ModalBody>

      <ModalFooter>
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting || !form.watch('title')?.trim()}
            onClick={form.handleSubmit(onSubmit)}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Create Subtask
              </>
            )}
          </Button>
        </div>
      </ModalFooter>
    </Modal>
  );
} 