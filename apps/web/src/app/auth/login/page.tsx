import type { Metadata, Viewport } from 'next'
import { LoginForm } from './LoginForm'
import { headers } from 'next/headers'

export const metadata: Metadata = {
  title: 'Login',
  description: 'Login to your account'
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover'
}

export default function LoginPage() {
  console.log('Rendering LoginPage')
  console.log('Headers:', Object.fromEntries(headers()))
  
  return <LoginForm />
} 