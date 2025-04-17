import { createEffect, onCleanup } from 'solid-js'
import { createThrottledSignal } from './createThrottledSignal'
import type { Accessor, Setter } from 'solid-js'
import type { ThrottlerOptions } from '@tanstack/pacer/throttler'

/**
 * A high-level Solid hook that creates a throttled version of a value that updates at most once within a specified time window.
 * This hook uses Solid's createSignal internally to manage the throttled state.
 *
 * Throttling ensures the value updates occur at a controlled rate regardless of how frequently the input value changes.
 * This is useful for rate-limiting expensive re-renders or API calls that depend on rapidly changing values.
 *
 * The hook returns both the throttled value and the underlying throttler instance for additional control.
 * The throttled value will update according to the leading/trailing edge behavior specified in the options.
 *
 * For more direct control over throttling behavior without Solid state management,
 * consider using the lower-level createThrottler hook instead.
 *
 * @example
 * ```tsx
 * // Basic throttling - update at most once per second
 * const [throttledValue] = createThrottledValue(rawValue, { wait: 1000 });
 *
 * // With custom leading/trailing behavior
 * const [throttledValue, throttler] = createThrottledValue(rawValue, {
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
export function createThrottledValue<TValue>(
  value: Accessor<TValue>,
  options: ThrottlerOptions<Setter<TValue>, [Accessor<TValue>]>,
) {
  const [throttledValue, setThrottledValue, throttler] = createThrottledSignal(
    value(),
    options,
  )

  createEffect(() => {
    setThrottledValue(value() as any)
    onCleanup(() => {
      throttler.cancel()
    })
  })

  return [throttledValue, throttler] as const
}
