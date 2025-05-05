import { createEffect } from 'solid-js'
import { createThrottledSignal } from './createThrottledSignal'
import type { SolidThrottler } from './createThrottler'
import type { Accessor, Setter } from 'solid-js'
import type { ThrottlerOptions } from '@tanstack/pacer/throttler'

/**
 * A high-level Solid hook that creates a throttled version of a value that updates at most once within a specified time window.
 * This hook uses Solid's createSignal internally to manage the throttled state.
 *
 * Throttling ensures the value updates occur at a controlled rate regardless of how frequently the input value changes.
 * This is useful for rate-limiting expensive re-renders or API calls that depend on rapidly changing values.
 *
 * The hook returns a tuple containing:
 * - An accessor function that provides the throttled value
 * - The throttler instance with control methods
 *
 * The throttled value will update according to the leading/trailing edge behavior specified in the options.
 *
 * For more direct control over throttling behavior without Solid state management,
 * consider using the lower-level createThrottler hook instead.
 *
 * @example
 * ```tsx
 * // Basic throttling - update at most once per second
 * const [throttledValue, throttler] = createThrottledValue(rawValue, { wait: 1000 });
 *
 * // Use the throttled value
 * console.log(throttledValue()); // Access the current throttled value
 *
 * // Control the throttler
 * throttler.cancel(); // Cancel any pending updates
 * ```
 */
export function createThrottledValue<TValue>(
  value: Accessor<TValue>,
  initialOptions: ThrottlerOptions<Setter<TValue>>,
): [Accessor<TValue>, SolidThrottler<Setter<TValue>>] {
  const [throttledValue, setThrottledValue, throttler] = createThrottledSignal(
    value(),
    initialOptions,
  )

  createEffect(() => {
    setThrottledValue(value() as any)
  })

  return [throttledValue, throttler]
}
