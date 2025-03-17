import { useEffect } from 'react'
import { useThrottledState } from './useThrottledState'
import type { ThrottlerOptions } from '@tanstack/pacer/throttler'

export function useThrottledValue<TValue>(
  value: TValue,
  options: ThrottlerOptions,
) {
  const [throttledValue, setThrottledValue, throttler] = useThrottledState(
    value,
    options,
  )

  useEffect(() => {
    setThrottledValue(value)
    return () => {
      throttler.cancel()
    }
  }, [value, setThrottledValue, throttler])

  return [throttledValue, throttler] as const
}
