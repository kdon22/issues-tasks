export function Loading({ overlay = false }) {
  const containerClasses = overlay 
    ? "fixed inset-0 bg-white/80 backdrop-blur-sm z-50"
    : "flex h-screen items-center justify-center"

  return (
    <div className={containerClasses}>
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary" />
    </div>
  )
} 