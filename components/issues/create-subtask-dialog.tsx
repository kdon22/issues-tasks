"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, X, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { IssueTypePicker } from './issue-type-picker';
import { StateBadge } from '@/components/ui/state-badge';
import { PriorityBadge } from '@/components/ui/priority-badge';
import { cn } from '@/lib/utils';

// Validation schema for subtask creation
const createSubtaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().optional(),
  priority: z.enum(['NO_PRIORITY', 'LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  assigneeId: z.string().optional(),
  stateId: z.string().min(1, 'State is required'),
  issueTypeId: z.string().min(1, 'Issue type is required'),
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
  color: string;
  description?: string | null;
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedIssueType, setSelectedIssueType] = useState<IssueType | null>(null);

  // Debug logging
  console.log('CreateSubtaskDialog function called with open:', open);
  console.log('Dialog props:', { parentIssue, workspaceUrl, issueTypes: issueTypes.length, states: states.length, members: members.length, projects: projects.length });

  const form = useForm<CreateSubtaskForm>({
    resolver: zodResolver(createSubtaskSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'MEDIUM',
      assigneeId: '',
      stateId: '',
      issueTypeId: '',
      projectId: parentIssue.projectId || '',
      estimate: undefined,
    }
  });

  // Set default issue type (subtask type if available)
  useEffect(() => {
    if (issueTypes.length > 0 && !selectedIssueType) {
      const subtaskType = issueTypes.find(type => type.icon === 'subtask');
      const defaultType = subtaskType || issueTypes[0];
      setSelectedIssueType(defaultType);
      form.setValue('issueTypeId', defaultType.id);
    }
  }, [issueTypes, selectedIssueType, form]);

  // Set default state (first unstarted state if available)
  useEffect(() => {
    if (states.length > 0 && !form.getValues('stateId')) {
      const defaultState = states.find(state => state.type === 'UNSTARTED') || states[0];
      form.setValue('stateId', defaultState.id);
    }
  }, [states, form]);

  const onSubmit = async (data: CreateSubtaskForm) => {
    setIsSubmitting(true);
    
    try {
      // Create subtask using workspace CRUD factory [[memory:2245441]]
      const response = await fetch(`/api/workspaces/${workspaceUrl}/issues`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          parentId: parentIssue.id,
          teamId: parentIssue.teamId,
          // Convert empty strings to null for optional fields
          assigneeId: data.assigneeId || null,
          projectId: data.projectId || null,
          estimate: data.estimate || null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create subtask');
      }

      const result = await response.json();
      
      // Call success callback
      onSubtaskCreated?.(result.data);
      
      // Close dialog and reset form
      onOpenChange(false);
      form.reset();
      setSelectedIssueType(null);
      
    } catch (error) {
      console.error('Error creating subtask:', error);
      // You might want to show a toast notification here
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    form.reset();
    setSelectedIssueType(null);
  };

  console.log('About to render Dialog with open:', open);
  
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-600" />
            Create Subtask
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Creating a subtask for <span className="font-medium">{parentIssue.identifier}</span>
          </p>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Issue Type Selection - The "Paper Icon" feature */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Issue Type</label>
              <IssueTypePicker 
                issueTypes={issueTypes}
                selectedIssueType={selectedIssueType}
                onSelect={(issueType) => {
                  setSelectedIssueType(issueType);
                  form.setValue('issueTypeId', issueType.id);
                }}
                placeholder="Select issue type"
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

            {/* Priority and State Row */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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

              <FormField
                control={form.control}
                name="stateId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {states.map((state) => (
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
            </div>

            {/* Assignee and Project Row */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="assigneeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assignee</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Assign to member" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span>Unassigned</span>
                          </div>
                        </SelectItem>
                        {members.map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-4 w-4">
                                <AvatarFallback className="text-xs">
                                  {(member.name || member.email).charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
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

              <FormField
                control={form.control}
                name="projectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
            </div>

            {/* Estimate */}
            <FormField
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

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
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
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 