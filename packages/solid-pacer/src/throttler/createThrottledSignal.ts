import { createSignal } from 'solid-js'
import { createThrottler } from './createThrottler'
import type { Accessor, Setter } from 'solid-js'
import type { ThrottlerOptions } from '@tanstack/pacer/throttler'

/**
 * A Solid hook that creates a throttled state value that updates at most once within a specified time window.
 * This hook combines Solid's createSignal with throttling functionality to provide controlled state updates.
 *
 * Throttling ensures state updates occur at a controlled rate regardless of how frequently the setter is called.
 * This is useful for rate-limiting expensive re-renders or operations that depend on rapidly changing state.
 *
 * The hook returns a tuple containing:
 * - The throttled state value accessor
 * - A throttled setter function that respects the configured wait time
 * - The throttler instance for additional control
 *
 * For more direct control over throttling without state management,
 * consider using the lower-level createThrottler hook instead.
 *
 * @example
 * ```tsx
 * // Basic throttling - update state at most once per second
 * const [value, setValue, throttler] = createThrottledSignal(0, { wait: 1000 });
 *
 * // With custom leading/trailing behavior
 * const [value, setValue] = createThrottledSignal(0, {
 *   wait: 1000,
 *   leading: true,   // Update immediately on first change
 *   trailing: false  // Skip trailing edge updates
 * });
 *
 * // Access throttler methods if needed
 * const handleReset = () => {
 *   setValue(0);
 *   throttler.cancel(); // Cancel any pending updates
 * };
 * ```
 */

export function createThrottledSignal<TValue>(
  value: TValue,
  initialOptions: ThrottlerOptions<Setter<TValue>, [Accessor<TValue>]>,
) {
  const [throttledValue, setThrottledValue] = createSignal<TValue>(value)
  const throttler = createThrottler(setThrottledValue, initialOptions)
  return [
    throttledValue,
    throttler.maybeExecute.bind(throttler) as Setter<TValue>,
    throttler,
  ] as const
}
