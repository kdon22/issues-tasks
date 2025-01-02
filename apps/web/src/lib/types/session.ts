export type Session = {
  user: {
    id: string
    email: string
    name: string | null
  }
  workspace: {
    id: string
    url: string
  }
} 