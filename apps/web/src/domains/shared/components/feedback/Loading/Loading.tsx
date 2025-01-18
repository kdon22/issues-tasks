'use client'

interface LoadingProps {
  fullScreen?: boolean
  overlay?: boolean
}

export function Loading({ fullScreen = true, overlay = false }: LoadingProps) {
  const containerClasses = fullScreen 
    ? "flex h-screen items-center justify-center"
    : "flex items-center justify-center p-4"

  if (overlay) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary" />
      </div>
    )
  }

  return (
    <div className={containerClasses}>
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  )
} 