import { router } from '../trpc'
import { workspaceRouter } from './workspace'
import { authRouter } from './auth'
import { userRouter } from './user'
import { teamRouter } from './team'
import { preferencesRouter } from './preferences'
import { healthRouter } from './health'
import { teamMemberRouter } from './teamMember'

export const appRouter = router({
  workspace: workspaceRouter,
  auth: authRouter,
  user: userRouter,
  team: teamRouter,
  preferences: preferencesRouter,
  health: healthRouter,
  teamMember: teamMemberRouter
})

export type AppRouter = typeof appRouter 