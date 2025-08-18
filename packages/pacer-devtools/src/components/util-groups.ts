export type StateKey =
  | 'asyncBatchers'
  | 'asyncDebouncers'
  | 'asyncQueuers'
  | 'asyncRateLimiters'
  | 'asyncThrottlers'
  | 'batchers'
  | 'debouncers'
  | 'queuers'
  | 'rateLimiters'
  | 'throttlers'

type UtilGroup = {
  key: StateKey
  label: string
  displayName: string
}

export const UTIL_GROUPS: Array<UtilGroup> = [
  { key: 'debouncers', label: 'Debouncers', displayName: 'Debouncer' },
  { key: 'throttlers', label: 'Throttlers', displayName: 'Throttler' },
  { key: 'batchers', label: 'Batchers', displayName: 'Batcher' },
  { key: 'queuers', label: 'Queuers', displayName: 'Queuer' },
  {
    key: 'rateLimiters',
    label: 'Rate Limiters',
    displayName: 'Rate Limiter',
  },
  {
    key: 'asyncDebouncers',
    label: 'Async Debouncers',
    displayName: 'Async Debouncer',
  },
  {
    key: 'asyncThrottlers',
    label: 'Async Throttlers',
    displayName: 'Async Throttler',
  },
  {
    key: 'asyncBatchers',
    label: 'Async Batchers',
    displayName: 'Async Batcher',
  },
  {
    key: 'asyncQueuers',
    label: 'Async Queuers',
    displayName: 'Async Queuer',
  },
  {
    key: 'asyncRateLimiters',
    label: 'Async Rate Limiters',
    displayName: 'Async Rate Limiter',
  },
]
