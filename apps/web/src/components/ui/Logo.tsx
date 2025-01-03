'use client'

import Image from 'next/image'
import { useState } from 'react'

export function Logo() {
  const [error, setError] = useState(false)

  if (error) {
    return <h1 className="text-2xl font-semibold">IssuesTasks</h1>
  }

  return (
    <Image
      src="/logo.png"
      alt="IssuesTasks Logo"
      width={300}
      height={90}
      priority
      onError={() => setError(true)}
      className="mb-4"
    />
  )
} 