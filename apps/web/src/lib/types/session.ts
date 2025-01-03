export interface Session {
  id: string
  email: string
  name: string | null
  workspace?: {
    id: string
    name: string
    url: string
  } | null
} 