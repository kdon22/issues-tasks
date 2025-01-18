import '@/infrastructure/styles/globals.css'
import { type Metadata } from 'next'
import { Suspense } from 'react'
import { AppProviders } from '@/infrastructure/providers/AppProviders'
import { Providers } from './providers'
import LoadingPage from './loading'

export const metadata: Metadata = {
  title: 'IssuesTasks',
  description: 'Project and issue tracking',
  icons: {
    icon: '/favicon.ico'
  }
}

// Prevent static rendering of root layout to ensure fresh session on each request
export const dynamic = 'force-dynamic'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <AppProviders>
            <Suspense fallback={<LoadingPage />}>
              {children}
            </Suspense>
          </AppProviders>
        </Providers>
      </body>
    </html>
  )
}
