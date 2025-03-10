import { useState } from 'react'
import { useThrottler } from './useThrottler'
import type { ThrottlerOptions } from '@tanstack/bouncer/throttler'

export function useThrottledState<TValue>(
  value: TValue,
  options: ThrottlerOptions,
) {
  const [throttledValue, setThrottledValue] = useState<TValue>(value)

  const throttler = useThrottler(setThrottledValue, options)

  return [throttledValue, throttler.throttle, throttler] as const
}
