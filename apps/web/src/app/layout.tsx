import { Inter } from 'next/font/google'
import '@/app/globals.css'
import { Providers } from '@/providers'
import { ThemeProvider } from 'next-themes'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <ThemeProvider attribute="class" defaultTheme="light">
            {children}
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  )
}
