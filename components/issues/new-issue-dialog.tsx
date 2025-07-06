// New Issue Dialog Component - Linear Clone
"use client";

import { useState } from 'react';
import { 
  CircleDot, 
  Plus, 
  ChevronDown, 
  User, 
  Tag,
  AlertCircle,
  Calendar,
  X
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { PriorityBadge } from '@/components/ui/priority-badge';
import { StateBadge } from '@/components/ui/state-badge';
import { cn } from '@/lib/utils';

interface NewIssueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewIssueDialog({ open, onOpenChange }: NewIssueDialogProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    state: 'BACKLOG',
    assignee: '',
    labels: [] as string[],
    project: '',
    dueDate: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Implement actual API call
      console.log('Creating issue:', formData);
      
      // Mock delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
             // Reset form
       setFormData({
         title: '',
         description: '',
         priority: 'MEDIUM',
         state: 'BACKLOG',
         assignee: '',
         labels: [],
         project: '',
         dueDate: ''
       });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to create issue:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickCreate = () => {
    if (formData.title.trim()) {
      handleSubmit(new Event('submit') as any);
    }
  };

  // Mock data - replace with real data
  const projects = [
    { id: '1', name: 'Web App', color: '#3B82F6' },
    { id: '2', name: 'Mobile App', color: '#10B981' },
    { id: '3', name: 'API', color: '#F59E0B' }
  ];

  const teamMembers = [
    { id: '1', name: 'John Doe', initials: 'JD' },
    { id: '2', name: 'Jane Smith', initials: 'JS' },
    { id: '3', name: 'Mike Johnson', initials: 'MJ' }
  ];

  const availableLabels = [
    { id: '1', name: 'bug', color: '#EF4444' },
    { id: '2', name: 'feature', color: '#10B981' },
    { id: '3', name: 'enhancement', color: '#3B82F6' },
    { id: '4', name: 'documentation', color: '#6366F1' }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 gap-0 bg-white dark:bg-slate-900">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <CircleDot className="w-5 h-5 text-orange-500" />
            New Issue
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-0">
          {/* Title */}
          <div className="px-6 pb-4">
            <Input
              placeholder="Issue title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="text-lg font-medium border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto bg-transparent placeholder:text-slate-400"
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="px-6 pb-4">
            <Textarea
              placeholder="Add a description..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 bg-transparent placeholder:text-slate-400 resize-none min-h-[80px]"
              rows={3}
            />
          </div>

          {/* Properties */}
          <div className="px-6 pb-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Priority */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Priority
                </label>
                <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}>
                  <SelectTrigger className="h-8">
                    <SelectValue>
                      <div className="flex items-center gap-2">
                        <PriorityBadge priority={formData.priority as any} />
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                                     <SelectContent>
                     <SelectItem value="NO_PRIORITY">
                       <div className="flex items-center gap-2">
                         <PriorityBadge priority="NO_PRIORITY" />
                       </div>
                     </SelectItem>
                     <SelectItem value="LOW">
                       <div className="flex items-center gap-2">
                         <PriorityBadge priority="LOW" />
                       </div>
                     </SelectItem>
                     <SelectItem value="MEDIUM">
                       <div className="flex items-center gap-2">
                         <PriorityBadge priority="MEDIUM" />
                       </div>
                     </SelectItem>
                     <SelectItem value="HIGH">
                       <div className="flex items-center gap-2">
                         <PriorityBadge priority="HIGH" />
                       </div>
                     </SelectItem>
                     <SelectItem value="URGENT">
                       <div className="flex items-center gap-2">
                         <PriorityBadge priority="URGENT" />
                       </div>
                     </SelectItem>
                   </SelectContent>
                </Select>
              </div>

              {/* State */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  State
                </label>
                <Select value={formData.state} onValueChange={(value) => setFormData(prev => ({ ...prev, state: value }))}>
                  <SelectTrigger className="h-8">
                    <SelectValue>
                      <div className="flex items-center gap-2">
                        <StateBadge state={formData.state as any} />
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                                     <SelectContent>
                     <SelectItem value="BACKLOG">
                       <div className="flex items-center gap-2">
                         <StateBadge state="BACKLOG" />
                       </div>
                     </SelectItem>
                     <SelectItem value="UNSTARTED">
                       <div className="flex items-center gap-2">
                         <StateBadge state="UNSTARTED" />
                       </div>
                     </SelectItem>
                     <SelectItem value="STARTED">
                       <div className="flex items-center gap-2">
                         <StateBadge state="STARTED" />
                       </div>
                     </SelectItem>
                     <SelectItem value="COMPLETED">
                       <div className="flex items-center gap-2">
                         <StateBadge state="COMPLETED" />
                       </div>
                     </SelectItem>
                   </SelectContent>
                </Select>
              </div>
            </div>

            {/* Assignee and Project */}
            <div className="grid grid-cols-2 gap-4">
              {/* Assignee */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Assignee
                </label>
                <Select value={formData.assignee} onValueChange={(value) => setFormData(prev => ({ ...prev, assignee: value }))}>
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="Unassigned">
                      {formData.assignee && (
                        <div className="flex items-center gap-2">
                          <Avatar className="w-4 h-4">
                            <AvatarFallback className="text-xs bg-orange-500 text-white">
                              {teamMembers.find(m => m.id === formData.assignee)?.initials}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">
                            {teamMembers.find(m => m.id === formData.assignee)?.name}
                          </span>
                        </div>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Unassigned</SelectItem>
                    {teamMembers.map(member => (
                      <SelectItem key={member.id} value={member.id}>
                        <div className="flex items-center gap-2">
                          <Avatar className="w-4 h-4">
                            <AvatarFallback className="text-xs bg-orange-500 text-white">
                              {member.initials}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{member.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Project */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Project
                </label>
                <Select value={formData.project} onValueChange={(value) => setFormData(prev => ({ ...prev, project: value }))}>
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="No project">
                      {formData.project && (
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: projects.find(p => p.id === formData.project)?.color }}
                          />
                          <span className="text-sm">
                            {projects.find(p => p.id === formData.project)?.name}
                          </span>
                        </div>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No project</SelectItem>
                    {projects.map(project => (
                      <SelectItem key={project.id} value={project.id}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: project.color }}
                          />
                          <span className="text-sm">{project.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between p-6 pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                ⌘↵
              </kbd>
              to create
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={!formData.title.trim() || isSubmitting}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                {isSubmitting ? 'Creating...' : 'Create Issue'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 