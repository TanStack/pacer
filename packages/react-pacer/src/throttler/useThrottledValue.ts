import { useEffect } from 'react'
import { useThrottledState } from './useThrottledState'
import type { Throttler, ThrottlerOptions } from '@tanstack/pacer/throttler'

/**
 * A high-level React hook that creates a throttled version of a value that updates at most once within a specified time window.
 * This hook uses React's useState internally to manage the throttled state.
 *
 * Throttling ensures the value updates occur at a controlled rate regardless of how frequently the input value changes.
 * This is useful for rate-limiting expensive re-renders or API calls that depend on rapidly changing values.
 *
 * The hook returns a tuple containing:
 * - The throttled value that updates according to the leading/trailing edge behavior specified in the options
 * - The throttler instance with control methods
 *
 * For more direct control over throttling behavior without React state management,
 * consider using the lower-level useThrottler hook instead.
 *
 * @example
 * ```tsx
 * // Basic throttling - update at most once per second
 * const [throttledValue, throttler] = useThrottledValue(rawValue, { wait: 1000 });
 *
 * // With custom leading/trailing behavior
 * const [throttledValue, throttler] = useThrottledValue(rawValue, {
 *   wait: 1000,
 *   leading: true,   // Update immediately on first change
 *   trailing: false  // Skip trailing edge updates
 * });
 * ```
 */
export function useThrottledValue<TValue>(
  value: TValue,
  options: ThrottlerOptions<React.Dispatch<React.SetStateAction<TValue>>>,
): [TValue, Throttler<React.Dispatch<React.SetStateAction<TValue>>>] {
  const [throttledValue, setThrottledValue, throttler] = useThrottledState(
    value,
    options,
  )

  useEffect(() => {
    setThrottledValue(value)
  }, [value, setThrottledValue])

  return [throttledValue, throttler]
}
