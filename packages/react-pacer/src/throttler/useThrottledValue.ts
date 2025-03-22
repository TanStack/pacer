import { useEffect } from 'react'
import { useThrottledState } from './useThrottledState'
import type { ThrottlerOptions } from '@tanstack/pacer/throttler'

/**
 * A high-level React hook that creates a throttled version of a value that updates at most once within a specified time window.
 * This hook uses React's useState internally to manage the throttled state.
 *
 * Throttling ensures the value updates occur at a controlled rate regardless of how frequently the input value changes.
 * This is useful for rate-limiting expensive re-renders or API calls that depend on rapidly changing values.
 *
 * The hook returns both the throttled value and the underlying throttler instance for additional control.
 * The throttled value will update according to the leading/trailing edge behavior specified in the options.
 *
 * For more direct control over throttling behavior without React state management,
 * consider using the lower-level useThrottler hook instead.
 *
 * @template TValue The type of the value to throttle
 * @param value The value to throttle
 * @param options Configuration options including wait time and execution behavior
 * @returns A tuple containing the throttled value and the throttler instance
 *
 * @example
 * ```tsx
 * // Basic throttling - update at most once per second
 * const [throttledValue] = useThrottledValue(rawValue, { wait: 1000 });
 *
 * // With custom leading/trailing behavior
 * const [throttledValue, throttler] = useThrottledValue(rawValue, {
 *   wait: 1000,
 *   leading: true,   // Update immediately on first change
 *   trailing: false  // Skip trailing edge updates
 * });
 *
 * // Optionally access throttler methods
 * const handleExecutionCount = () => {
 *   console.log('Executions:', throttler.getExecutionCount());
 * };
 * ```
 */
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
