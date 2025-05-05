import { useState } from 'react'
import { useThrottler } from './useThrottler'
import type { Throttler, ThrottlerOptions } from '@tanstack/pacer/throttler'

/**
 * A React hook that creates a throttled state value that updates at most once within a specified time window.
 * This hook combines React's useState with throttling functionality to provide controlled state updates.
 *
 * Throttling ensures state updates occur at a controlled rate regardless of how frequently the setter is called.
 * This is useful for rate-limiting expensive re-renders or operations that depend on rapidly changing state.
 *
 * The hook returns a tuple containing:
 * - The throttled state value
 * - A throttled setter function that respects the configured wait time
 * - The throttler instance for additional control
 *
 * For more direct control over throttling without state management,
 * consider using the lower-level useThrottler hook instead.
 *
 * @example
 * ```tsx
 * // Basic throttling - update state at most once per second
 * const [value, setValue, throttler] = useThrottledState(0, { wait: 1000 });
 *
 * // With custom leading/trailing behavior
 * const [value, setValue] = useThrottledState(0, {
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

export function useThrottledState<TValue>(
  value: TValue,
  options: ThrottlerOptions<React.Dispatch<React.SetStateAction<TValue>>>,
): [
  TValue,
  React.Dispatch<React.SetStateAction<TValue>>,
  Throttler<React.Dispatch<React.SetStateAction<TValue>>>,
] {
  const [throttledValue, setThrottledValue] = useState<TValue>(value)
  const throttler = useThrottler(setThrottledValue, options)
  return [throttledValue, throttler.maybeExecute, throttler]
}
