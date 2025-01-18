'use client'

import { cn } from '@/domains/shared/utils/cn'
import { Button } from '@/domains/shared/components/inputs'

interface SettingsCardProps {
  children: React.ReactNode
  className?: string
}

function SettingsCard({ children, className }: SettingsCardProps) {
  return (
    <div className={cn('bg-white rounded-lg shadow', className)}>
      {children}
    </div>
  )
}

function Header({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-6 py-4 border-b">
      {children}
    </div>
  )
}

function Title({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-lg font-medium text-gray-900">
      {children}
    </h3>
  )
}

function Description({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-1 text-sm text-gray-500">
      {children}
    </p>
  )
}

function Content({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-6 py-4">
      {children}
    </div>
  )
}

function Footer({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-6 py-4 border-t bg-gray-50">
      {children}
    </div>
  )
}

function DeleteSection({ 
  title,
  description,
  onDelete 
}: { 
  title: string
  description: string
  onDelete: () => Promise<void>
}) {
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-red-600">{title}</h4>
      <p className="text-sm text-gray-500">{description}</p>
      <Button 
        variant="danger" 
        onClick={onDelete}
      >
        Delete
      </Button>
    </div>
  )
}

SettingsCard.Header = Header
SettingsCard.Title = Title
SettingsCard.Description = Description
SettingsCard.Content = Content
SettingsCard.Footer = Footer
SettingsCard.DeleteSection = DeleteSection

export { SettingsCard } 