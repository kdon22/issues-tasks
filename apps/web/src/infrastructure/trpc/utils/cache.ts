export const CACHE_TIMES = {
  NEVER: {
    staleTime: 0,
    cacheTime: 0,
  },
  SHORT: {
    staleTime: 1000 * 60, // 1 minute
    cacheTime: 1000 * 60 * 5, // 5 minutes
  },
  MEDIUM: {
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 30, // 30 minutes
  },
  LONG: {
    staleTime: 1000 * 60 * 30, // 30 minutes
    cacheTime: 1000 * 60 * 60 * 24, // 24 hours
  },
} 