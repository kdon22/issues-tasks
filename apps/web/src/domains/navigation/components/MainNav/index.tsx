'use client'

import { useRouter, usePathname } from 'next/navigation'
import { 
  Search, Inbox, FolderClosed, 
  LayoutGrid, Users, Plus, 
  ListTodo, ChevronDown, Flag
} from 'lucide-react'
import { UserMenu } from './UserMenu'
import { Button } from '@/domains/shared/components/inputs'
import { useState } from 'react'
import { trpc } from '@/infrastructure/trpc/core/client'

export function MainNav() {
  const [workspaceExpanded, setWorkspaceExpanded] = useState(true)
  const [favoritesExpanded, setFavoritesExpanded] = useState(true)
  const [teamsExpanded, setTeamsExpanded] = useState(true)
  const [flagsExpanded, setFlagsExpanded] = useState(true)

  const { data: workspace } = trpc.workspace.getCurrent.useQuery()

  if (!workspace) return null

  return (
    <div className="flex flex-col h-full">
      {/* Top Section */}
      <div className="flex items-center gap-2 p-2 border-b">
        <UserMenu />
        <Button variant="ghost" size="icon">
          <Search size={20} />
        </Button>
        <Button>
          <Plus size={16} className="mr-2" />
          New Issue
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-6">
        {/* Main Items */}
        <div className="space-y-1">
          <NavItem icon={Inbox} label="Inbox" href="/inbox" />
          <NavItem icon={ListTodo} label="My Issues" href="/issues" />
        </div>

        {/* Workspace Section */}
        <div>
          <button 
            onClick={() => setWorkspaceExpanded(!workspaceExpanded)}
            className="flex items-center justify-between w-full p-2 text-sm font-medium text-gray-700"
          >
            <span>Workspace</span>
            <ChevronDown size={16} className={`transform transition-transform ${workspaceExpanded ? 'rotate-180' : ''}`} />
          </button>
          {workspaceExpanded && (
            <div className="ml-2 space-y-1">
              <NavItem icon={FolderClosed} label="Projects" href="/projects" />
              <NavItem icon={LayoutGrid} label="Views" href="/views" />
              <NavItem icon={Users} label="Teams" href="/teams" />
              <NavItem icon={Users} label="Members" href="/members" />
            </div>
          )}
        </div>

        {/* Flags Section */}
        <div>
          <button 
            onClick={() => setFlagsExpanded(!flagsExpanded)}
            className="flex items-center justify-between w-full p-2 text-sm font-medium text-gray-700"
          >
            <span>Flags</span>
            <ChevronDown size={16} className={`transform transition-transform ${flagsExpanded ? 'rotate-180' : ''}`} />
          </button>
          {flagsExpanded && (
            <div className="ml-2 space-y-1">
              <NavItem icon={Flag} label="Blocked" href="/flags/blocked" />
              <NavItem icon={Flag} label="At Risk" href="/flags/at-risk" />
              <NavItem icon={Flag} label="On Track" href="/flags/on-track" />
            </div>
          )}
        </div>

        {/* Favorites Section */}
        <div>
          <button 
            onClick={() => setFavoritesExpanded(!favoritesExpanded)}
            className="flex items-center justify-between w-full p-2 text-sm font-medium text-gray-700"
          >
            <span>Favorites</span>
            <ChevronDown size={16} className={`transform transition-transform ${favoritesExpanded ? 'rotate-180' : ''}`} />
          </button>
          {favoritesExpanded && (
            <div className="ml-2 space-y-1">
              {/* Favorite items will be dynamically added here */}
            </div>
          )}
        </div>

        {/* Teams Section */}
        <div>
          <button 
            onClick={() => setTeamsExpanded(!teamsExpanded)}
            className="flex items-center justify-between w-full p-2 text-sm font-medium text-gray-700"
          >
            <span>Your Teams</span>
            <ChevronDown size={16} className={`transform transition-transform ${teamsExpanded ? 'rotate-180' : ''}`} />
          </button>
          {teamsExpanded && (
            <div className="ml-2 space-y-1">
              {/* Team items will be dynamically added here */}
            </div>
          )}
        </div>
      </nav>
    </div>
  )
}

function NavItem({ icon: Icon, label, href }: { icon: any, label: string, href: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <button 
      onClick={() => router.push(href)}
      className={`flex items-center w-full px-2 py-1.5 text-sm rounded-md
        ${isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-50'}`}
    >
      <Icon size={18} className="mr-2" />
      {label}
    </button>
  )
} 