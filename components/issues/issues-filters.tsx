"use client";

import { useState } from 'react';
import { Search, Filter, X, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface Team {
  id: string;
  name: string;
  identifier: string;
}

interface Project {
  id: string;
  name: string;
  identifier: string;
  color?: string;
}

interface IssueType {
  id: string;
  name: string;
  icon?: string;
  color: string;
}

interface Member {
  id: string;
  name: string;
  email: string;
}

interface IssuesFiltersProps {
  teams: Team[];
  projects: Project[];
  issueTypes: IssueType[];
  members: Member[];
  onFiltersChange?: (filters: {
    search: string;
    status: string[];
    assignee: string[];
    project: string[];
    team: string[];
    issueType: string[];
  }) => void;
}

export function IssuesFilters({ 
  teams, 
  projects, 
  issueTypes, 
  members, 
  onFiltersChange 
}: IssuesFiltersProps) {
  const [search, setSearch] = useState('');
  const [activeFilters, setActiveFilters] = useState<{
    status: string[];
    assignee: string[];
    project: string[];
    team: string[];
    issueType: string[];
  }>({
    status: [],
    assignee: [],
    project: [],
    team: [],
    issueType: [],
  });

  const statuses = [
    { value: 'BACKLOG', label: 'Backlog', color: '#6B7280' },
    { value: 'UNSTARTED', label: 'Todo', color: '#6B7280' },
    { value: 'STARTED', label: 'In Progress', color: '#3B82F6' },
    { value: 'COMPLETED', label: 'Done', color: '#10B981' },
    { value: 'CANCELED', label: 'Canceled', color: '#EF4444' },
  ];

  const updateFilters = (newFilters: Partial<typeof activeFilters>) => {
    const updated = { ...activeFilters, ...newFilters };
    setActiveFilters(updated);
    onFiltersChange?.({
      search,
      ...updated,
    });
  };

  const addFilter = (type: keyof typeof activeFilters, value: string) => {
    if (!activeFilters[type].includes(value)) {
      updateFilters({
        [type]: [...activeFilters[type], value]
      });
    }
  };

  const removeFilter = (type: keyof typeof activeFilters, value: string) => {
    updateFilters({
      [type]: activeFilters[type].filter(v => v !== value)
    });
  };

  const clearAllFilters = () => {
    setSearch('');
    setActiveFilters({
      status: [],
      assignee: [],
      project: [],
      team: [],
      issueType: [],
    });
    onFiltersChange?.({
      search: '',
      status: [],
      assignee: [],
      project: [],
      team: [],
      issueType: [],
    });
  };

  const getFilterLabel = (type: keyof typeof activeFilters, value: string) => {
    switch (type) {
      case 'status':
        return statuses.find(s => s.value === value)?.label || value;
      case 'assignee':
        return members.find(m => m.id === value)?.name || value;
      case 'project':
        return projects.find(p => p.id === value)?.name || value;
      case 'team':
        return teams.find(t => t.id === value)?.name || value;
      case 'issueType':
        return issueTypes.find(it => it.id === value)?.name || value;
      default:
        return value;
    }
  };

  const totalActiveFilters = Object.values(activeFilters).flat().length;

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search issues..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              onFiltersChange?.({
                search: e.target.value,
                ...activeFilters,
              });
            }}
            className="pl-10"
          />
        </div>

        {/* Status Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Status
              {activeFilters.status.length > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
                  {activeFilters.status.length}
                </Badge>
              )}
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64" align="start">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Filter by Status</h4>
              {statuses.map((status) => (
                <div
                  key={status.value}
                  className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                  onClick={() => {
                    if (activeFilters.status.includes(status.value)) {
                      removeFilter('status', status.value);
                    } else {
                      addFilter('status', status.value);
                    }
                  }}
                >
                  <input
                    type="checkbox"
                    checked={activeFilters.status.includes(status.value)}
                    onChange={() => {}} // Handled by onClick above
                    className="rounded"
                  />
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: status.color }}
                  />
                  <span className="text-sm">{status.label}</span>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Assignee Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              Assignee
              {activeFilters.assignee.length > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
                  {activeFilters.assignee.length}
                </Badge>
              )}
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64" align="start">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Filter by Assignee</h4>
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                  onClick={() => {
                    if (activeFilters.assignee.includes(member.id)) {
                      removeFilter('assignee', member.id);
                    } else {
                      addFilter('assignee', member.id);
                    }
                  }}
                >
                  <input
                    type="checkbox"
                    checked={activeFilters.assignee.includes(member.id)}
                    onChange={() => {}} // Handled by onClick above
                    className="rounded"
                  />
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">
                      {member.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{member.name}</span>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Project Filter */}
        {projects.length > 0 && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                Project
                {activeFilters.project.length > 0 && (
                  <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
                    {activeFilters.project.length}
                  </Badge>
                )}
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64" align="start">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Filter by Project</h4>
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                    onClick={() => {
                      if (activeFilters.project.includes(project.id)) {
                        removeFilter('project', project.id);
                      } else {
                        addFilter('project', project.id);
                      }
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={activeFilters.project.includes(project.id)}
                      onChange={() => {}} // Handled by onClick above
                      className="rounded"
                    />
                    <div 
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: project.color || '#6B7280' }}
                    />
                    <span className="text-sm">{project.name}</span>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        )}

        {/* Clear Filters */}
        {totalActiveFilters > 0 && (
          <Button variant="ghost" size="sm" onClick={clearAllFilters}>
            Clear all
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {totalActiveFilters > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(activeFilters).map(([type, values]) =>
            values.map((value) => (
              <Badge
                key={`${type}-${value}`}
                variant="secondary"
                className="px-2 py-1"
              >
                {getFilterLabel(type as keyof typeof activeFilters, value)}
                <button
                  onClick={() => removeFilter(type as keyof typeof activeFilters, value)}
                  className="ml-2 hover:text-red-500"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))
          )}
        </div>
      )}
    </div>
  );
} 