import { injectAsyncDebouncer } from './injectAsyncDebouncer'
import type { AsyncDebouncerOptions } from '@tanstack/pacer/async-debouncer'
import type { AnyAsyncFunction } from '@tanstack/pacer/types'

/**
 * An Angular function that creates an async debounced version of a callback function.
 * This function is essentially a wrapper around `injectAsyncDebouncer` that provides
 * a simplified API for basic async debouncing needs.
 *
 * The debounced function will only execute after the specified wait time has elapsed
 * since its last invocation. If called again before the wait time expires, the timer
 * resets and starts waiting again.
 *
 * This function provides a simpler API compared to `injectAsyncDebouncer`, making it ideal for basic
 * async debouncing needs. However, it does not expose the underlying AsyncDebouncer instance.
 *
 * For advanced usage requiring features like:
 * - Manual cancellation
 * - Access to execution counts
 * - Error handling callbacks
 * - Retry support
 *
 * Consider using the `injectAsyncDebouncer` function instead.
 *
 * @example
 * ```ts
 * // Debounce an async search handler
 * const handleSearch = injectAsyncDebouncedCallback(
 *   async (query: string) => {
 *     const response = await fetch(`/api/search?q=${query}`);
 *     return response.json();
 *   },
 *   { wait: 500 }
 * );
 *
 * // Use in an input
 * const results = await handleSearch(searchQuery);
 * ```
 */
export function injectAsyncDebouncedCallback<TFn extends AnyAsyncFunction>(
  fn: TFn,
  options: AsyncDebouncerOptions<TFn>,
): (...args: Parameters<TFn>) => Promise<Awaited<ReturnType<TFn>> | undefined> {
  const debouncer = injectAsyncDebouncer(fn, options)
  return async (...args: Parameters<TFn>) => {
    const result = await debouncer.maybeExecute(...args)
    // Not sure if this is the best way to handle this,
    return result !== undefined ? await result : undefined
  }
}
