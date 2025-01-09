import "next-auth"

declare module "next-auth" {
  interface User {
    id: string
    defaultWorkspace: string | null
  }

  interface Session {
    user: User & {
      id: string
      defaultWorkspace: string | null
    }
  }
} 