#!/usr/bin/env tsx

import { appRouter } from '../src/lib/trpc/router'
import { createContext } from '../src/lib/trpc/context'

async function validateTrpc() {
  try {
    // Verify router structure
    const routerKeys = Object.keys(appRouter._def.procedures)
    const requiredRouters = ['user', 'workspace', 'health']
    
    for (const router of requiredRouters) {
      if (!routerKeys.includes(router)) {
        throw new Error(`Missing required router: ${router}`)
      }
    }

    // Test context creation
    const ctx = await createContext({})
    if (!ctx.prisma) {
      throw new Error('Prisma client not initialized in context')
    }

    console.log('✅ TRPC validation passed')
    process.exit(0)
  } catch (error) {
    console.error('❌ TRPC validation failed:', error)
    process.exit(1)
  }
}

validateTrpc() 