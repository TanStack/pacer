import { useState } from 'react'
import { Throttler } from '@tanstack/pacer/throttler'
import type { ThrottlerOptions } from '@tanstack/pacer/throttler'

/**
 * A low-level React hook that creates a `Throttler` instance that limits how often the provided function can execute.
 *
 * This hook is designed to be flexible and state-management agnostic - it simply returns a throttler instance that
 * you can integrate with any state management solution (useState, Redux, Zustand, Jotai, etc). For a simpler and higher-level hook that
 * integrates directly with React's useState, see useThrottledState.
 *
 * Throttling ensures a function executes at most once within a specified time window,
 * regardless of how many times it is called. This is useful for rate-limiting
 * expensive operations or UI updates.
 *
 * The hook returns an object containing:
 * - maybeExecute: The throttled function that respects the configured wait time
 * - cancel: A function to cancel any pending trailing execution
 * - getExecutionCount: A function that returns the number of times the throttled function has executed
 *
 * @example
 * ```tsx
 * // Basic throttling with custom state
 * const [value, setValue] = useState(0);
 * const { maybeExecute } = useThrottler(setValue, { wait: 1000 });
 *
 * // With Redux
 * const dispatch = useDispatch();
 * const { maybeExecute } = useThrottler(
 *   (value) => dispatch(updateAction(value)),
 *   { wait: 1000 }
 * );
 *
 * // With any state manager
 * const { maybeExecute, cancel } = useThrottler(
 *   (value) => stateManager.setState(value),
 *   {
 *     wait: 2000,
 *     leading: true,   // Execute immediately on first call
 *     trailing: false  // Skip trailing edge updates
 *   }
 * );
 * ```
 */
export function useThrottler<
  TFn extends (...args: Array<any>) => any,
  TArgs extends Parameters<TFn>,
>(fn: TFn, options: ThrottlerOptions<TFn, TArgs>) {
  const [throttler] = useState(() => new Throttler<TFn, TArgs>(fn, options))

  throttler.setOptions(options)

  return throttler
}
