import { Inter } from 'next/font/google'
import '@/app/globals.css'
import { Providers } from '@/providers/Providers'

export const metadata = {
  title: 'IssuesTasks',
  description: 'Task and Issue Management',
}

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} font-sans`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
