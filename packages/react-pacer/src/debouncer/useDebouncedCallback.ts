import { useCallback } from 'react'
import { useDebouncer } from './useDebouncer'
import type { DebouncerOptions } from '@tanstack/pacer'

/**
 * A React hook that creates a debounced version of a callback function.
 * This hook is essentially a wrapper around the basic `debounce` function
 * that is exported from `@tanstack/pacer`,
 * but optimized for React with reactive options and a stable function reference.
 *
 * The debounced function will only execute after the specified wait time has elapsed
 * since its last invocation. If called again before the wait time expires, the timer
 * resets and starts waiting again.
 *
 * This hook provides a simpler API compared to `useDebouncer`, making it ideal for basic
 * debouncing needs. However, it does not expose the underlying Debouncer instance.
 *
 * For advanced usage requiring features like:
 * - Manual cancellation
 * - Access to execution counts
 * - Custom useCallback dependencies
 *
 * Consider using the `useDebouncer` hook instead.
 *
 * @example
 * ```tsx
 * // Debounce a search handler
 * const handleSearch = useDebouncedCallback((query: string) => {
 *   fetchSearchResults(query);
 * }, {
 *   wait: 500 // Wait 500ms between executions
 * });
 *
 * // Use in an input
 * <input
 *   type="text"
 *   onChange={(e) => handleSearch(e.target.value)}
 * />
 * ```
 */
export function useDebouncedCallback<
  TFn extends (...args: Array<any>) => any,
  TArgs extends Parameters<TFn>,
>(fn: TFn, options: DebouncerOptions) {
  const debouncedFn = useDebouncer<TFn, TArgs>(fn, options).maybeExecute
  return useCallback((...args: TArgs) => debouncedFn(...args), [debouncedFn])
}
