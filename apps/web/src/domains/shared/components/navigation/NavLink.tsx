'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/domains/shared/utils/cn'

interface NavLinkProps {
  href: string
  children: React.ReactNode
  className?: string
}

export function NavLink({ href, children, className }: NavLinkProps) {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Link
      href={href}
      className={cn(
        'block px-3 py-2 rounded-md text-sm font-medium',
        isActive 
          ? 'bg-gray-100 text-gray-900'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
        className
      )}
    >
      {children}
    </Link>
  )
} 