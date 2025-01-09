'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface NavItemProps {
  icon: LucideIcon
  label: string
  href: string
}

export function NavItem({ icon: Icon, label, href }: NavItemProps) {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-2 px-2 py-1.5 text-gray-800 hover:bg-gray-100 rounded-md',
        isActive && 'bg-gray-100'
      )}
    >
      <Icon size={18} className="text-gray-700" />
      <span className="text-sm">{label}</span>
    </Link>
  )
} 