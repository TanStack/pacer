import { useState } from 'react'
import { useThrottler } from './useThrottler'
import type { ReactThrottler } from './useThrottler'
import type {
  ThrottlerOptions,
  ThrottlerState,
} from '@tanstack/pacer/throttler'

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
 * ## State Management and Selector
 *
 * The hook uses TanStack Store for reactive state management via the underlying throttler instance.
 * The `selector` parameter allows you to specify which throttler state changes will trigger a re-render,
 * optimizing performance by preventing unnecessary re-renders when irrelevant state changes occur.
 *
 * **By default, all throttler state changes will trigger a re-render.** To optimize performance, you can
 * provide a selector function that returns only the specific state values your component needs.
 * The component will only re-render when the selected values change.
 *
 * Available throttler state properties:
 * - `executionCount`: Number of function executions that have been completed
 * - `lastArgs`: The arguments from the most recent call to maybeExecute
 * - `lastExecutionTime`: Timestamp of the last function execution in milliseconds
 * - `nextExecutionTime`: Timestamp when the next execution can occur in milliseconds
 * - `isPending`: Whether the throttler is waiting for the timeout to trigger execution
 * - `status`: Current execution status ('disabled' | 'idle' | 'pending')
 *
 * @example
 * ```tsx
 * // Basic throttling - update state at most once per second (re-renders on any throttler state change)
 * const [value, setValue, throttler] = useThrottledState(0, { wait: 1000 });
 *
 * // Only re-render when execution count changes (optimized for tracking executions)
 * const [value, setValue, throttler] = useThrottledState(
 *   0,
 *   { wait: 1000 },
 *   (state) => ({ executionCount: state.executionCount })
 * );
 *
 * // Only re-render when throttling state changes (optimized for loading indicators)
 * const [value, setValue, throttler] = useThrottledState(
 *   0,
 *   { wait: 1000 },
 *   (state) => ({
 *     isPending: state.isPending,
 *     status: state.status
 *   })
 * );
 *
 * // Only re-render when timing information changes (optimized for timing displays)
 * const [value, setValue, throttler] = useThrottledState(
 *   0,
 *   { wait: 1000 },
 *   (state) => ({
 *     lastExecutionTime: state.lastExecutionTime,
 *     nextExecutionTime: state.nextExecutionTime
 *   })
 * );
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
 *
 * // Access the selected throttler state
 * const { executionCount, isPending } = throttler.state;
 * ```
 */

export function useThrottledState<
  TValue,
  TSelected = ThrottlerState<React.Dispatch<React.SetStateAction<TValue>>>,
>(
  value: TValue,
  options: ThrottlerOptions<React.Dispatch<React.SetStateAction<TValue>>>,
  selector?: (
    state: ThrottlerState<React.Dispatch<React.SetStateAction<TValue>>>,
  ) => TSelected,
): [
  TValue,
  React.Dispatch<React.SetStateAction<TValue>>,
  ReactThrottler<React.Dispatch<React.SetStateAction<TValue>>, TSelected>,
] {
  const [throttledValue, setThrottledValue] = useState<TValue>(value)
  const throttler = useThrottler(setThrottledValue, options, selector)
  return [throttledValue, throttler.maybeExecute, throttler]
}
