export const createOptimisticData = <T>(old: T | undefined, data: Partial<T>): T => {
  if (!old) {
    return data as T
  }
  
  if (Array.isArray(old)) {
    return [...old] as T
  }

  return {
    ...old,
    ...data
  } as T
} 