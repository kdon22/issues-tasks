'use client'

type SettingsCardProps = {
  title: string
  description?: string
  children: React.ReactNode
}

export function SettingsCard({ title, description, children }: SettingsCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <div className="mb-6">
        <h2 className="text-lg font-medium">{title}</h2>
        {description && (
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        )}
      </div>
      {children}
    </div>
  )
} 