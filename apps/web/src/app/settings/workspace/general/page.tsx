'use client'

import { useState } from 'react'
import { trpc } from 'apps/web/src/lib/trpc/client'
import Image from 'next/image'
import { Button } from 'apps/web/src/components/ui/Button'
import { Input } from 'apps/web/src/components/ui/Input'

export default function WorkspaceSettingsPage() {
  const { data: workspace, isLoading } = trpc.workspace.getCurrent.useQuery()
  const updateWorkspace = trpc.workspace.update.useMutation()

  const [formData, setFormData] = useState({
    name: workspace?.name || '',
    url: workspace?.url || '',
    logo: workspace?.logo || '',
    fiscalYearStart: workspace?.fiscalYearStart || 'January',
    region: workspace?.region || 'United States',
  })

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  // Auto-save handler
  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    updateWorkspace.mutate({ [field]: value })
  }

  if (isLoading) return <div>Loading...</div>

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-8">Workspace</h1>

      <div className="space-y-8">
        {/* Logo Section */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Logo</h2>
          <p className="text-sm text-gray-500">
            Recommended size is 256x256px
          </p>
          <div className="flex items-center space-x-4">
            {formData.logo ? (
              <Image
                src={formData.logo}
                alt="Workspace logo"
                width={64}
                height={64}
                className="rounded-md"
              />
            ) : (
              <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center">
                <span className="text-2xl text-gray-400">
                  {formData.name.charAt(0)}
                </span>
              </div>
            )}
            <Button variant="secondary">
              Change logo
            </Button>
          </div>
        </section>

        {/* Name Section */}
        <Input
          label="Name"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
        />

        {/* URL Section */}
        <Input
          label="URL"
          prefix="issuestasks.app/"
          value={formData.url}
          onChange={(e) => handleChange('url', e.target.value)}
        />

        {/* Time & Region Section */}
        <section className="space-y-6">
          <h2 className="text-lg font-semibold">Time & region</h2>
          
          <Input
            label="First month of the fiscal year"
            helperText="Used when grouping projects and issues quarterly, half-yearly, and yearly"
            value={formData.fiscalYearStart}
            onChange={(e) => handleChange('fiscalYearStart', e.target.value)}
            as="select"
          >
            {months.map(month => (
              <option key={month} value={month}>{month}</option>
            ))}
          </Input>

          <Input
            label="Region"
            helperText={
              <>
                Set when a workspace is created and cannot be changed.
                <a href="#" className="text-primary ml-1">Read more ↗</a>
              </>
            }
            value={formData.region}
            disabled
          />
        </section>

        {/* Danger Zone */}
        <section className="space-y-4 mt-12">
          <h2 className="text-lg font-semibold text-red-600">Danger zone</h2>
          <div className="border border-red-200 rounded-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium">Delete workspace</h3>
                <p className="text-sm text-gray-500">
                  Schedule workspace to be permanently deleted
                </p>
              </div>
              <Button variant="danger">
                Delete...
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
} 