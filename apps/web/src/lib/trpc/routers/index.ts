import { router } from '../trpc'
import { authRouter } from './auth'
import { workspaceRouter } from './workspace'
import { teamRouter } from './team'
import { userRouter } from './user'

export const appRouter = router({
  auth: authRouter,
  workspace: workspaceRouter,
  team: teamRouter,
  user: userRouter,
})

export type AppRouter = typeof appRouter 