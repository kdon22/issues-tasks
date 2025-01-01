'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'

export default function ProfilePage() {
  const { data: user, isLoading } = trpc.user.getProfile.useQuery()
  const updateProfile = trpc.user.updateProfile.useMutation()

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  })

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-8">Profile</h1>

      <div className="space-y-8">
        <section>
          <div className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              />
            </div>

            {/* Save Button */}
            <div>
              <button
                onClick={() => updateProfile.mutate(formData)}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Save changes
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
} 