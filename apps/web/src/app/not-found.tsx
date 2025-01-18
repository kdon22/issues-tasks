import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-gray-600 mb-4">This page could not be found</p>
        <Link 
          href="/"
          className="text-primary hover:underline"
        >
          Go Home
        </Link>
      </div>
    </div>
  )
} 