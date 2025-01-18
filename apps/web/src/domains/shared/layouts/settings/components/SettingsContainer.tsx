'use client'

type SettingsContainerProps = {
  children: React.ReactNode
}

export function SettingsContainer({ children }: SettingsContainerProps) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 w-full">
      {children}
    </div>
  )
} 