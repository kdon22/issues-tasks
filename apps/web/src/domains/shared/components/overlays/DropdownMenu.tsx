'use client'

import * as React from 'react'
import { Menu } from '@headlessui/react'
import { cn } from '@/domains/shared/utils/cn'

interface DropdownMenuProps {
  children: React.ReactNode
}

export function DropdownMenu({ children }: DropdownMenuProps) {
  return <Menu as="div" className="relative inline-block text-left">{children}</Menu>
}

interface TriggerProps {
  children: React.ReactNode
  asChild?: boolean
}

DropdownMenu.Trigger = function DropdownTrigger({ children, asChild }: TriggerProps) {
  if (asChild) {
    return <Menu.Button as={React.Fragment}>{children}</Menu.Button>
  }
  return <Menu.Button>{children}</Menu.Button>
}

interface ContentProps {
  children: React.ReactNode
  align?: 'left' | 'right'
  className?: string
}

DropdownMenu.Content = function DropdownContent({ 
  children, 
  align = 'right',
  className 
}: ContentProps) {
  return (
    <Menu.Items
      className={cn(
        'absolute z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none',
        align === 'left' ? 'left-0' : 'right-0',
        className
      )}
    >
      <div className="py-1">{children}</div>
    </Menu.Items>
  )
}

interface ItemProps {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  className?: string
}

DropdownMenu.Item = function DropdownItem({ 
  children, 
  onClick, 
  disabled,
  className 
}: ItemProps) {
  return (
    <Menu.Item disabled={disabled}>
      {({ active }) => (
        <button
          onClick={onClick}
          className={cn(
            'group flex w-full items-center px-4 py-2 text-sm',
            active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
            disabled && 'cursor-not-allowed opacity-50',
            className
          )}
        >
          {children}
        </button>
      )}
    </Menu.Item>
  )
}

interface LabelProps {
  children: React.ReactNode
  className?: string
}

DropdownMenu.Label = function DropdownLabel({ children, className }: LabelProps) {
  return (
    <div className={cn('px-4 py-2 text-xs font-semibold text-gray-500', className)}>
      {children}
    </div>
  )
}

DropdownMenu.Separator = function DropdownSeparator({ className }: { className?: string }) {
  return <div className={cn('my-1 h-px bg-gray-200', className)} />
} 