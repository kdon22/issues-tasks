'use client'

import { useRouter, usePathname } from 'next/navigation'
import type { LucideIcon } from 'lucide-react'

interface NavItemProps {
  icon?: LucideIcon
  label: string
  href: string
}

export function NavItem({ icon: Icon, label, href }: NavItemProps) {
  const router = useRouter()
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <button 
      onClick={() => router.push(href)}
      className={`flex items-center w-full px-2 py-1.5 text-sm rounded-md
        ${isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-50'}`}
    >
      {Icon && <Icon size={18} className="mr-2" />}
      {label}
    </button>
  )
} 