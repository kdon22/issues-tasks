'use client'

import { useState } from 'react'
import { 
  Search, Inbox, Home, ChevronDown, FolderClosed, 
  LayoutGrid, Star, Users, Plus, HelpCircle, Clock,
  Hash
} from 'lucide-react'
import { useWorkspace } from '@/lib/hooks/useWorkspace'
import { usePathname } from 'next/navigation'
import { WorkspaceDropdown } from './WorkspaceDropdown'
import { NavItem, FolderItem, TeamSection, FavoritesSection } from './components'
import { api } from '@/lib/trpc/client'
import { getInitials, stringToColor } from '@/lib/utils'
import { type AvatarType } from '@/lib/types/avatar'

interface WorkspaceItem {
  id: string
  name: string
  url: string
  avatarType: AvatarType
  avatarIcon?: string | null
  avatarColor?: string | null
  avatarEmoji?: string | null
  avatarImageUrl?: string | null
}

export function Sidebar() {
  const [workspaceDropdownOpen, setWorkspaceDropdownOpen] = useState(false)
  const [cyclesExpanded, setCyclesExpanded] = useState(true)
  const pathname = usePathname()
  const { workspace, switchWorkspace } = useWorkspace()
  const { data: workspaces } = api.workspace.list.useQuery()

  if (!workspace) return null

  const workspaceUrl = workspace.url
  const currentWorkspaceWithColor = {
    ...workspace,
    initials: getInitials(workspace.name),
    color: {
      from: 'blue-500',
      to: 'blue-600'
    }
  }

  const formattedWorkspaces = workspaces?.map((w: WorkspaceItem) => ({
    ...w,
    initials: getInitials(w.name),
    color: {
      from: `${stringToColor(w.name)}-500`,
      to: `${stringToColor(w.name)}-600`
    }
  })) || []

  return (
    <div className="w-64 h-screen bg-gray-50 border-r border-gray-200 flex flex-col">
      {/* Workspace Header */}
      <div className="relative border-b border-gray-200">
        <div className="flex items-center justify-between p-2">
          <button 
            onClick={() => setWorkspaceDropdownOpen(!workspaceDropdownOpen)}
            className="flex items-center gap-2 hover:bg-gray-100 rounded-md py-1.5 px-2 transition-colors group flex-1 min-w-0"
          >
            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-md flex items-center justify-center shadow-sm flex-shrink-0">
              <span className="text-white font-medium text-sm">{currentWorkspaceWithColor.initials}</span>
            </div>
            <div className="flex flex-col items-start min-w-0 flex-1">
              <div className="flex items-center gap-1 w-full">
                <span className="font-medium text-gray-900 truncate text-sm">{workspace.name}</span>
                <ChevronDown 
                  size={14} 
                  className={`text-gray-500 transition-transform duration-200 flex-shrink-0 ${
                    workspaceDropdownOpen ? 'transform rotate-180' : ''
                  }`} 
                />
              </div>
            </div>
          </button>

          <div className="flex items-center gap-1">
            <button className="p-1.5 hover:bg-gray-100 rounded-md text-gray-700">
              <Search size={16} />
            </button>
            <button className="p-1.5 hover:bg-gray-100 rounded-md text-gray-700">
              <Plus size={16} />
            </button>
          </div>

          {workspaceDropdownOpen && (
            <WorkspaceDropdown
              currentWorkspace={currentWorkspaceWithColor}
              workspaces={formattedWorkspaces}
              onClose={() => setWorkspaceDropdownOpen(false)}
              onSwitchWorkspace={switchWorkspace}
              onLogout={() => {}} // This is handled in WorkspaceDropdown
            />
          )}
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto">
        <nav className="px-1 py-2 flex flex-col gap-1">
          <NavItem 
            icon={Inbox} 
            label="Inbox" 
            href={`/${workspaceUrl}/inbox`}
          />
          <NavItem 
            icon={Home} 
            label="My Issues" 
            href={`/${workspaceUrl}/my-issues`}
          />
          
          <div className="mt-4">
            <div className="px-3 mb-1">
              <span className="text-xs font-medium text-gray-500">Workspace</span>
            </div>
            <NavItem 
              icon={Users} 
              label="Initiatives" 
              href={`/${workspaceUrl}/initiatives`}
            />
            <NavItem 
              icon={FolderClosed} 
              label="Projects" 
              href={`/${workspaceUrl}/projects`}
            />
            <NavItem 
              icon={LayoutGrid} 
              label="Views" 
              href={`/${workspaceUrl}/views`}
            />
          </div>

          <FavoritesSection />

          <div className="mt-4">
            <div className="px-3 mb-1">
              <span className="text-xs font-medium text-gray-500">Your teams</span>
            </div>
            
            {/* PB Team Section with nested items */}
            <TeamSection label="PB" icon={Hash}>
              <NavItem 
                icon={Star} 
                label="Triage" 
                href={`/${workspaceUrl}/teams/pb/triage`}
              />
              <NavItem 
                icon={Inbox} 
                label="Issues" 
                href={`/${workspaceUrl}/teams/pb/issues`}
              />
              
              {/* Cycles with nested items */}
              <div className="flex flex-col">
                <button 
                  onClick={() => setCyclesExpanded(!cyclesExpanded)}
                  className="flex items-center gap-2 px-2 py-1.5 text-gray-800 hover:bg-gray-100 rounded-md ml-2"
                >
                  <Clock size={18} className="text-gray-700" />
                  <span className="text-sm flex-1">Cycles</span>
                  <ChevronDown 
                    size={14} 
                    className={`text-gray-500 transition-transform ${cyclesExpanded ? 'transform rotate-180' : ''}`}
                  />
                </button>
                {cyclesExpanded && (
                  <div className="flex flex-col gap-0.5">
                    <FolderItem 
                      label="Current" 
                      isNested 
                      href={`/${workspaceUrl}/teams/pb/cycles/current`}
                    />
                    <FolderItem 
                      label="Upcoming" 
                      isNested 
                      href={`/${workspaceUrl}/teams/pb/cycles/upcoming`}
                    />
                  </div>
                )}
              </div>
            </TeamSection>
          </div>
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="mt-auto p-2 flex items-center justify-between border-t border-gray-200">
        <button className="p-1.5 hover:bg-gray-100 rounded-md">
          <HelpCircle size={16} className="text-gray-600" />
        </button>
        <button className="px-3 py-1 text-xs text-gray-600 border border-gray-200 rounded-full hover:bg-gray-100">
          Free plan
        </button>
      </div>
    </div>
  )
} 