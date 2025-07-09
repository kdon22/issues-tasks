"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, X, Calendar, Flag, User, Tag, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PriorityBadge } from '@/components/ui/priority-badge';
import { StateBadge } from '@/components/ui/state-badge';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { useCreateIssue } from '@/lib/hooks';
import { toast } from 'sonner';

const createIssueSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().optional(),
  priority: z.enum(['URGENT', 'HIGH', 'MEDIUM', 'LOW']).default('MEDIUM'),
  assigneeId: z.string().optional(),
  stateId: z.string().optional(),
  projectId: z.string().optional(),
  estimate: z.number().optional(),
  dueDate: z.date().optional(),
  labels: z.array(z.string()).default([])
});

type CreateIssueForm = z.infer<typeof createIssueSchema>;

interface CreateIssueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateIssueDialog({ open, onOpenChange }: CreateIssueDialogProps) {
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createIssue = useCreateIssue();

  const form = useForm<CreateIssueForm>({
    resolver: zodResolver(createIssueSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'MEDIUM',
      labels: []
    }
  });

  const priorities = [
    { value: 'URGENT', label: 'Urgent', color: 'bg-red-500' },
    { value: 'HIGH', label: 'High', color: 'bg-orange-500' },
    { value: 'MEDIUM', label: 'Medium', color: 'bg-yellow-500' },
    { value: 'LOW', label: 'Low', color: 'bg-green-500' }
  ];

  const states = [
    { value: 'backlog', label: 'Backlog', color: 'bg-gray-500' },
    { value: 'todo', label: 'Todo', color: 'bg-blue-500' },
    { value: 'in-progress', label: 'In Progress', color: 'bg-yellow-500' }
  ];

  const assignees = [
    { value: 'user1', label: 'John Doe', avatar: '/avatars/john.jpg' },
    { value: 'user2', label: 'Jane Smith', avatar: '/avatars/jane.jpg' },
    { value: 'user3', label: 'Bob Johnson', avatar: '/avatars/bob.jpg' }
  ];

  const projects = [
    { value: 'web-app', label: 'Web App' },
    { value: 'mobile-app', label: 'Mobile App' },
    { value: 'api', label: 'API' }
  ];

  const availableLabels = [
    { value: 'bug', label: 'Bug', color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300' },
    { value: 'feature', label: 'Feature', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300' },
    { value: 'improvement', label: 'Improvement', color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' },
    { value: 'docs', label: 'Documentation', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300' }
  ];

  const onSubmit = async (data: CreateIssueForm) => {
    setIsSubmitting(true);
    try {
      const createdIssue = await createIssue({
        ...data,
        labels: selectedLabels,
        teamId: 'default-team', // This would come from context
        workspaceId: 'default-workspace' // This would come from context
      } as any);
      
      // Custom toast with clickable issue number
      const issueIdentifier = (createdIssue as any)?.identifier || `#${(createdIssue as any)?.number}` || 'NEW';
      const issueTitle = (createdIssue as any)?.title || data.title;
      
      toast.success(
        <div className="flex items-center gap-2">
          <span>Issue </span>
          <button 
            className="font-mono font-semibold text-blue-600 hover:text-blue-800 underline"
            onClick={() => {
              window.location.href = `/workspaces/default-workspace/issues/${createdIssue.id}`;
            }}
          >
            {issueIdentifier}
          </button>
          <span> created: {issueTitle}</span>
        </div>
      );
      
      onOpenChange(false);
      form.reset();
      setSelectedLabels([]);
    } catch (error) {
      toast.error('Failed to create issue');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleLabel = (labelValue: string) => {
    setSelectedLabels(prev => 
      prev.includes(labelValue)
        ? prev.filter(l => l !== labelValue)
        : [...prev, labelValue]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        {/* Gradient Header */}
        <div className="relative -m-6 mb-6 p-6 bg-gradient-to-r from-orange-500/10 via-purple-500/10 to-blue-500/10 dark:from-orange-500/5 dark:via-purple-500/5 dark:to-blue-500/5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_transparent_0%,_rgba(255,255,255,0.1)_100%)]" />
          <div className="relative">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                Create New Issue
              </DialogTitle>
              <DialogDescription className="text-slate-600 dark:text-slate-400">
                Create a new issue to track work and collaborate with your team
              </DialogDescription>
            </DialogHeader>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Title
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter issue title..."
                      {...field}
                      className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 focus:border-orange-500 dark:focus:border-orange-500 transition-all"
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
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Description
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the issue..."
                      rows={4}
                      {...field}
                      className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 focus:border-orange-500 dark:focus:border-orange-500 transition-all resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Priority and State Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Priority
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 focus:border-orange-500 dark:focus:border-orange-500">
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {priorities.map((priority) => (
                          <SelectItem key={priority.value} value={priority.value}>
                            <div className="flex items-center space-x-2">
                              <div className={`w-2 h-2 rounded-full ${priority.color}`} />
                              <span>{priority.label}</span>
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
                name="stateId"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      State
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 focus:border-orange-500 dark:focus:border-orange-500">
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {states.map((state) => (
                          <SelectItem key={state.value} value={state.value}>
                            <div className="flex items-center space-x-2">
                              <div className={`w-2 h-2 rounded-full ${state.color}`} />
                              <span>{state.label}</span>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="assigneeId"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Assignee
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 focus:border-orange-500 dark:focus:border-orange-500">
                          <SelectValue placeholder="Select assignee" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {assignees.map((assignee) => (
                          <SelectItem key={assignee.value} value={assignee.value}>
                            <div className="flex items-center space-x-2">
                              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white text-xs">
                                {assignee.label.split(' ').map(n => n[0]).join('')}
                              </div>
                              <span>{assignee.label}</span>
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
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Project
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 focus:border-orange-500 dark:focus:border-orange-500">
                          <SelectValue placeholder="Select project" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {projects.map((project) => (
                          <SelectItem key={project.value} value={project.value}>
                            {project.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Labels */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Labels
              </Label>
              <div className="flex flex-wrap gap-2">
                {availableLabels.map((label) => (
                  <Badge
                    key={label.value}
                    variant={selectedLabels.includes(label.value) ? "default" : "outline"}
                    className={`cursor-pointer transition-all hover:scale-105 ${
                      selectedLabels.includes(label.value) 
                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg' 
                        : 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                    onClick={() => toggleLabel(label.value)}
                  >
                    {label.label}
                    {selectedLabels.includes(label.value) && (
                      <X className="w-3 h-3 ml-1" />
                    )}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-700">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Issue
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