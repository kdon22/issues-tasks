export function asContextValue<T>(value: unknown): T {
  return value as T
}

export interface BaseContextValue<T> {
  [key: string]: T | null
}

// Specific context types
export interface WorkspaceContextValue extends BaseContextValue<{
  id: string
  url: string
  name: string
}> {
  workspace: {
    id: string
    url: string
    name: string
  } | null
}

export interface UserContextValue extends BaseContextValue<{
  id: string
  email: string
  name: string
}> {
  user: {
    id: string
    email: string
    name: string
  } | null
}

// Add more context types as needed... 