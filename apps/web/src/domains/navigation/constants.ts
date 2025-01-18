import { NavigationSection } from './types'
import { 
  HomeIcon, 
  UsersIcon, 
  Cog6ToothIcon as CogIcon, 
  BuildingOfficeIcon as BuildingIcon,
  KeyIcon,
  BellIcon,
  WrenchScrewdriverIcon as WrenchIcon 
} from '@heroicons/react/24/outline'

export const MAIN_NAVIGATION: NavigationSection[] = [
  {
    items: [
      { name: 'Dashboard', href: '/[workspaceUrl]', icon: HomeIcon },
      { name: 'My Issues', href: '/[workspaceUrl]/my-issues', icon: UsersIcon }
    ]
  }
]

export const WORKSPACE_SETTINGS_NAVIGATION: NavigationSection[] = [
  {
    name: 'Workspace',
    items: [
      { 
        name: 'General', 
        href: '/[workspaceUrl]/settings/workspace/general',
        icon: BuildingIcon 
      },
      { 
        name: 'Members', 
        href: '/[workspaceUrl]/settings/workspace/members',
        icon: UsersIcon 
      },
      {
        name: 'Integrations',
        href: '/[workspaceUrl]/settings/workspace/integrations',
        icon: WrenchIcon
      }
    ]
  }
]

export const ACCOUNT_SETTINGS_NAVIGATION: NavigationSection[] = [
  {
    name: 'Account',
    items: [
      {
        name: 'Profile',
        href: '/[workspaceUrl]/settings/account/profile',
        icon: CogIcon
      },
      {
        name: 'Security',
        href: '/[workspaceUrl]/settings/account/security', 
        icon: KeyIcon
      },
      {
        name: 'Preferences',
        href: '/[workspaceUrl]/settings/account/preferences',
        icon: BellIcon
      }
    ]
  }
] 