'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/domains/shared/utils/cn'
import { FolderClosed } from 'lucide-react'

interface FolderItemProps {
  label: string
  href: string
  isNested?: boolean
}

export function FolderItem({ label, href, isNested = false }: FolderItemProps) {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-2 px-2 py-1.5 text-gray-800 hover:bg-gray-100 rounded-md',
        isNested && 'ml-4',
        isActive && 'bg-gray-100'
      )}
    >
      <FolderClosed size={16} className="text-gray-700" />
      <span className="text-sm">{label}</span>
    </Link>
  )
} 