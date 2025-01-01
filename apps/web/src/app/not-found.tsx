import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-4">The page you're looking for doesn't exist.</p>
        <Link
          href="/"
          className="text-[#635bff] hover:text-[#0a2540] font-medium"
        >
          Go Home
        </Link>
      </div>
    </div>
  )
} 