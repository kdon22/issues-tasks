import { router } from './trpc'
import { authRouter } from './routers/auth'
import { userRouter } from './routers/user'
import { workspaceRouter } from './routers/workspace'
import { teamRouter } from './routers/team'

export const appRouter = router({
  auth: authRouter,
  user: userRouter,
  workspace: workspaceRouter,
  team: teamRouter,
})

export type AppRouter = typeof appRouter 