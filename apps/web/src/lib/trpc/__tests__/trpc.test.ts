import { describe, it, expect } from 'vitest'
import { appRouter } from '../router'
import { createContext } from '../context'

describe('TRPC Setup', () => {
  it('should have all required routers', () => {
    const routerKeys = Object.keys(appRouter._def.procedures)
    expect(routerKeys).toContain('user')
    expect(routerKeys).toContain('workspace')
    // Add other expected routers
  })

  it('should create context successfully', async () => {
    const ctx = await createContext({})
    expect(ctx).toBeDefined()
    expect(ctx.prisma).toBeDefined()
  })
}) 