"use client";

import { useState } from 'react';
import { Check, X, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';

export function IssueFilters() {
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);

  const states = [
    { id: 'backlog', name: 'Backlog', color: 'bg-gray-500' },
    { id: 'todo', name: 'Todo', color: 'bg-blue-500' },
    { id: 'in-progress', name: 'In Progress', color: 'bg-yellow-500' },
    { id: 'done', name: 'Done', color: 'bg-green-500' },
    { id: 'cancelled', name: 'Cancelled', color: 'bg-red-500' }
  ];

  const priorities = [
    { id: 'urgent', name: 'Urgent', color: 'bg-red-500' },
    { id: 'high', name: 'High', color: 'bg-orange-500' },
    { id: 'medium', name: 'Medium', color: 'bg-yellow-500' },
    { id: 'low', name: 'Low', color: 'bg-green-500' }
  ];

  const assignees = [
    { id: 'user1', name: 'John Doe', avatar: '/avatars/john.jpg' },
    { id: 'user2', name: 'Jane Smith', avatar: '/avatars/jane.jpg' },
    { id: 'user3', name: 'Bob Johnson', avatar: '/avatars/bob.jpg' }
  ];

  const labels = [
    { id: 'bug', name: 'Bug', color: 'bg-red-100 text-red-800' },
    { id: 'feature', name: 'Feature', color: 'bg-blue-100 text-blue-800' },
    { id: 'improvement', name: 'Improvement', color: 'bg-green-100 text-green-800' },
    { id: 'docs', name: 'Documentation', color: 'bg-purple-100 text-purple-800' }
  ];

  const toggleSelection = (value: string, currentSelection: string[], setSelection: (items: string[]) => void) => {
    if (currentSelection.includes(value)) {
      setSelection(currentSelection.filter(item => item !== value));
    } else {
      setSelection([...currentSelection, value]);
    }
  };

  const clearAll = () => {
    setSelectedStates([]);
    setSelectedPriorities([]);
    setSelectedAssignees([]);
    setSelectedLabels([]);
  };

  const hasActiveFilters = selectedStates.length > 0 || selectedPriorities.length > 0 || selectedAssignees.length > 0 || selectedLabels.length > 0;

  return (
    <div className="space-y-6">
      {/* Filter Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Filters</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4 mr-2" />
            Clear All
          </Button>
        )}
      </div>

      {/* Filter Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* State Filter */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Status</Label>
          <div className="space-y-2">
            {states.map((state) => (
              <div key={state.id} className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleSelection(state.id, selectedStates, setSelectedStates)}
                  className={`w-full justify-start h-8 px-2 ${
                    selectedStates.includes(state.id) 
                      ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300' 
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${state.color} mr-2`} />
                  <span className="text-sm">{state.name}</span>
                  {selectedStates.includes(state.id) && (
                    <Check className="w-3 h-3 ml-auto" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Filter */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Priority</Label>
          <div className="space-y-2">
            {priorities.map((priority) => (
              <div key={priority.id} className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleSelection(priority.id, selectedPriorities, setSelectedPriorities)}
                  className={`w-full justify-start h-8 px-2 ${
                    selectedPriorities.includes(priority.id) 
                      ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300' 
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${priority.color} mr-2`} />
                  <span className="text-sm">{priority.name}</span>
                  {selectedPriorities.includes(priority.id) && (
                    <Check className="w-3 h-3 ml-auto" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Assignee Filter */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Assignee</Label>
          <div className="space-y-2">
            {assignees.map((assignee) => (
              <div key={assignee.id} className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleSelection(assignee.id, selectedAssignees, setSelectedAssignees)}
                  className={`w-full justify-start h-8 px-2 ${
                    selectedAssignees.includes(assignee.id) 
                      ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300' 
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white text-xs mr-2">
                    {assignee.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <span className="text-sm">{assignee.name}</span>
                  {selectedAssignees.includes(assignee.id) && (
                    <Check className="w-3 h-3 ml-auto" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Labels Filter */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Labels</Label>
          <div className="space-y-2">
            {labels.map((label) => (
              <div key={label.id} className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleSelection(label.id, selectedLabels, setSelectedLabels)}
                  className={`w-full justify-start h-8 px-2 ${
                    selectedLabels.includes(label.id) 
                      ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300' 
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="w-2 h-2 rounded-full bg-slate-400 mr-2" />
                  <span className="text-sm">{label.name}</span>
                  {selectedLabels.includes(label.id) && (
                    <Check className="w-3 h-3 ml-auto" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="space-y-3">
          <Separator />
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">Active Filters</h4>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {selectedStates.length + selectedPriorities.length + selectedAssignees.length + selectedLabels.length} active
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedStates.map((stateId) => {
              const state = states.find(s => s.id === stateId);
              return (
                <Badge
                  key={stateId}
                  variant="secondary"
                  className="bg-gradient-to-r from-orange-100 to-orange-200 dark:from-orange-900/20 dark:to-orange-800/20 text-orange-700 dark:text-orange-300 border-0"
                >
                  {state?.name}
                  <button
                    onClick={() => toggleSelection(stateId, selectedStates, setSelectedStates)}
                    className="ml-2 hover:text-orange-900 dark:hover:text-orange-100"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              );
            })}
            {selectedPriorities.map((priorityId) => {
              const priority = priorities.find(p => p.id === priorityId);
              return (
                <Badge
                  key={priorityId}
                  variant="secondary"
                  className="bg-gradient-to-r from-orange-100 to-orange-200 dark:from-orange-900/20 dark:to-orange-800/20 text-orange-700 dark:text-orange-300 border-0"
                >
                  {priority?.name}
                  <button
                    onClick={() => toggleSelection(priorityId, selectedPriorities, setSelectedPriorities)}
                    className="ml-2 hover:text-orange-900 dark:hover:text-orange-100"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              );
            })}
            {selectedAssignees.map((assigneeId) => {
              const assignee = assignees.find(a => a.id === assigneeId);
              return (
                <Badge
                  key={assigneeId}
                  variant="secondary"
                  className="bg-gradient-to-r from-orange-100 to-orange-200 dark:from-orange-900/20 dark:to-orange-800/20 text-orange-700 dark:text-orange-300 border-0"
                >
                  {assignee?.name}
                  <button
                    onClick={() => toggleSelection(assigneeId, selectedAssignees, setSelectedAssignees)}
                    className="ml-2 hover:text-orange-900 dark:hover:text-orange-100"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              );
            })}
            {selectedLabels.map((labelId) => {
              const label = labels.find(l => l.id === labelId);
              return (
                <Badge
                  key={labelId}
                  variant="secondary"
                  className="bg-gradient-to-r from-orange-100 to-orange-200 dark:from-orange-900/20 dark:to-orange-800/20 text-orange-700 dark:text-orange-300 border-0"
                >
                  {label?.name}
                  <button
                    onClick={() => toggleSelection(labelId, selectedLabels, setSelectedLabels)}
                    className="ml-2 hover:text-orange-900 dark:hover:text-orange-100"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
} 