import '@/styles/globals.css'
import { Inter } from 'next/font/google'
import { TrpcProvider } from '@/providers/TrpcProvider'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata = {
  title: 'IssuesTasks',
  description: 'Modern issue tracking system',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`font-sans antialiased ${inter.className}`}>
        <TrpcProvider>
          {children}
        </TrpcProvider>
      </body>
    </html>
  )
}
