import { router } from '../trpc'
import { userRouter } from './userProfile'
import { workspaceRouter } from './workspace'
import { avatarRouter } from './avatar'
import { teamMemberRouter } from './teamMember'
import { teamRouter } from './team'
import { authRouter } from './auth'
import { healthRouter } from './health'
import { preferencesRouter } from './preferences'

export const appRouter = router({
  user: userRouter,
  workspace: workspaceRouter,
  avatar: avatarRouter,
  teamMember: teamMemberRouter,
  team: teamRouter,
  auth: authRouter,
  health: healthRouter,
  preferences: preferencesRouter,
})

export type AppRouter = typeof appRouter 