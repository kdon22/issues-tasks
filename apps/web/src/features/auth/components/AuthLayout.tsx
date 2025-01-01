'use client'

import { type PropsWithChildren } from 'react'
import Link from 'next/link'

export function AuthLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="p-8">
        <Link href="/" className="inline-flex items-center">
          <div className="flex items-center">
            <svg 
              className="h-8 w-8 text-primary" 
              viewBox="0 0 24 24" 
              fill="currentColor"
            >
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14h-2v-4H7v-2h5V7h2v4h5v2h-5v4z"/>
            </svg>
            <span className="ml-2 text-2xl font-bold text-gray-900">
              IssuesTasks
            </span>
          </div>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center">
        {children}
      </div>
    </div>
  )
} 