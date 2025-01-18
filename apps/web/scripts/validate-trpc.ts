#!/usr/bin/env tsx

import { appRouter } from '../src/infrastructure/trpc/routers/router'
import { createContext } from '../src/infrastructure/trpc/core/context'
import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch'

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

    // Create mock request for context
    const mockReq = new Request('http://localhost:3000')
    const contextOptions: FetchCreateContextFnOptions = {
      req: mockReq,
      resHeaders: new Headers()
    }

    // Test context creation
    const ctx = await createContext(contextOptions)
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