'use client'

import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface NavLinkProps {
  href: string
  children: React.ReactNode
  matchPattern: string
}

function NavLink({ href, children, matchPattern }: NavLinkProps) {
  const pathname = usePathname()
  const isActive = pathname?.includes(matchPattern)

  return (
    <Link
      href={href}
      className={cn(
        "block px-3 py-2 text-sm font-medium rounded-md",
        isActive ? "bg-gray-50 text-gray-900" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
      )}
    >
      {children}
    </Link>
  )
}

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const params = useParams()
  const workspaceUrl = params.workspaceUrl as string

  return (
    <div className="flex min-h-screen">
      {/* Settings navigation */}
      <div className="w-60 border-r border-gray-200">
        <nav className="p-4 space-y-8">
          <div>
            <div className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              WORKSPACE
            </div>
            <div className="mt-3 space-y-1">
              <NavLink 
                href={`/${workspaceUrl}/settings/workspace/general`}
                matchPattern="/workspace/general"
              >
                General
              </NavLink>
              <NavLink 
                href={`/${workspaceUrl}/settings/workspace/members`}
                matchPattern="/workspace/members"
              >
                Members
              </NavLink>
            </div>
          </div>

          <div>
            <div className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              ACCOUNT
            </div>
            <div className="mt-3 space-y-1">
              <NavLink 
                href={`/${workspaceUrl}/settings/account/profile`}
                matchPattern="/account/profile"
              >
                Profile
              </NavLink>
              <NavLink 
                href={`/${workspaceUrl}/settings/account/preferences`}
                matchPattern="/account/preferences"
              >
                Preferences
              </NavLink>
            </div>
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 p-8">
        {children}
      </div>
    </div>
  )
} 