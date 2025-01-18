'use client'

interface SettingsHeaderProps {
  title: string
  description?: string
  actions?: React.ReactNode
}

export function SettingsHeader({ title, description, actions }: SettingsHeaderProps) {
  return (
    <div className="border-b border-gray-200 bg-white px-8 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
          {description && (
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          )}
        </div>
        {actions && <div>{actions}</div>}
      </div>
    </div>
  )
} 