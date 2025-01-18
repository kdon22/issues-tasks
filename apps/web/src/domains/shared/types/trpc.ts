import type { 
  User as PrismaUser,
  Team as PrismaTeam,
  TeamMember as PrismaTeamMember,
  Workspace as PrismaWorkspace
} from '@prisma/client'

// Define our enhanced types based on Prisma types
interface User extends PrismaUser {
  preferences: {
    theme?: string
    language?: string
  }
}

interface Team extends PrismaTeam {
  members?: TeamMember[]
  workspace?: Workspace
}

interface TeamMember extends PrismaTeamMember {
  user?: User
  team?: Team
}

interface Workspace extends PrismaWorkspace {
  teams?: Team[]
}

// Define all possible operations
type Operation = 'get' | 'list' | 'create' | 'update' | 'delete'

// Define models
const Models = {
  user: 'user',
  team: 'team',
  teamMember: 'teamMember'
} as const

type ModelName = keyof typeof Models

// Define base input types that are reused
interface BaseInput {
  id?: string
}

interface ListInput extends BaseInput {
  page?: number
  limit?: number
  sort?: string
  filter?: Record<string, unknown>
}

// Define input types for each operation by model
type ModelInputs = {
  [Models.user]: {
    'get': BaseInput
    'list': ListInput
    'create': Omit<User, 'id'>
    'update': Partial<User> & BaseInput
    'delete': BaseInput
  }
  [Models.team]: {
    'get': BaseInput
    'list': ListInput & { workspaceId: string }
    'create': Omit<Team, 'id'> & { workspaceId: string }
    'update': Partial<Team> & BaseInput
    'delete': BaseInput
  }
  [Models.teamMember]: {
    'get': BaseInput & { teamId: string }
    'list': ListInput & { teamId: string }
    'create': { teamId: string; userId: string; role: string }
    'update': { teamId: string; userId: string; role: string }
    'delete': BaseInput & { teamId: string }
  }
}

// Map inputs to their respective paths
export type RouterInput = {
  [M in ModelName]: {
    [O in Operation]: `${M}.${O}` extends keyof ModelInputs[M] 
      ? ModelInputs[M][O]
      : never
  }
}

// Map outputs to their respective paths
export type RouterOutput = {
  // User operations
  'user.get': User
  'user.list': { items: User[]; total: number }
  'user.create': User
  'user.update': User
  'user.delete': { success: boolean }

  // Team operations
  'team.get': Team
  'team.list': { items: Team[]; total: number }
  'team.create': Team
  'team.update': Team
  'team.delete': { success: boolean }

  // TeamMember operations
  'teamMember.get': TeamMember
  'teamMember.list': { items: TeamMember[]; total: number }
  'teamMember.create': TeamMember
  'teamMember.update': TeamMember
  'teamMember.delete': { success: boolean }
}

// Helper type to get input type for a specific path
export type PathInput<P extends keyof RouterInput> = RouterInput[P]

// Helper type to get output type for a specific path
export type PathOutput<P extends keyof RouterOutput> = RouterOutput[P] 