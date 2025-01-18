import NextAuth from 'next-auth'
import { authOptions } from '@/infrastructure/auth/config'

// Add debug logging
console.log('Setting up NextAuth handler')

const handler = NextAuth(authOptions)

// Explicitly type the exports
export const GET = handler
export const POST = handler 