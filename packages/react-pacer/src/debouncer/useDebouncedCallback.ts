import { useCallback } from 'react'
import { useDebouncer } from './useDebouncer'
import type {
  DebouncerOptions,
  DebouncerState,
} from '@tanstack/pacer/debouncer'
import type { AnyFunction } from '@tanstack/pacer/types'

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
 * ## State Management and Re-renders
 *
 * **By default, this callback hook disables re-renders from internal debouncer state changes**
 * for optimal performance. The callback function reference remains stable regardless of
 * internal state changes. However, you can opt into re-renders by providing a custom
 * `selector` function that returns the specific state values you want to track.
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
 * // Debounce a search handler (no re-renders from internal state)
 * const handleSearch = useDebouncedCallback((query: string) => {
 *   fetchSearchResults(query);
 * }, {
 *   wait: 500 // Wait 500ms between executions
 * });
 *
 * // Opt into re-renders when pending state changes
 * const handleSearch = useDebouncedCallback((query: string) => {
 *   fetchSearchResults(query);
 * },
 * { wait: 500 },
 * (state) => ({ isPending: state.isPending })
 * );
 *
 * // Use in an input
 * <input
 *   type="search"
 *   onChange={(e) => handleSearch(e.target.value)}
 * />
 * ```
 */
export function useDebouncedCallback<TFn extends AnyFunction, TSelected = {}>(
  fn: TFn,
  options: DebouncerOptions<TFn>,
  selector: (state: DebouncerState<TFn>) => TSelected = () => ({}) as TSelected,
): (...args: Parameters<TFn>) => void {
  const debouncedFn = useDebouncer(fn, options, selector).maybeExecute
  return useCallback((...args) => debouncedFn(...args), [debouncedFn])
}
