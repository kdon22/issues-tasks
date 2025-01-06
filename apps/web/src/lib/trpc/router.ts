import { router } from './trpc'
import { userRouter } from './routers/userProfile'
import { workspaceRouter } from './routers/workspace'
import { authRouter } from './routers/auth'
// ... other imports

export const appRouter = router({
  user: userRouter,
  workspace: workspaceRouter,
  auth: authRouter,
  // ... other routers
})

export type AppRouter = typeof appRouter 