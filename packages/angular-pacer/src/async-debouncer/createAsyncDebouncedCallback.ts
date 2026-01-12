import { createAsyncDebouncer } from './createAsyncDebouncer'
import type { AsyncDebouncerOptions } from '@tanstack/pacer/async-debouncer'
import type { AnyAsyncFunction } from '@tanstack/pacer/types'

/**
 * An Angular function that creates an async debounced version of a callback function.
 * This function is essentially a wrapper around `createAsyncDebouncer` that provides
 * a simplified API for basic async debouncing needs.
 *
 * The debounced function will only execute after the specified wait time has elapsed
 * since its last invocation. If called again before the wait time expires, the timer
 * resets and starts waiting again.
 *
 * This function provides a simpler API compared to `createAsyncDebouncer`, making it ideal for basic
 * async debouncing needs. However, it does not expose the underlying AsyncDebouncer instance.
 *
 * For advanced usage requiring features like:
 * - Manual cancellation
 * - Access to execution counts
 * - Error handling callbacks
 * - Retry support
 *
 * Consider using the `createAsyncDebouncer` function instead.
 *
 * @example
 * ```ts
 * // Debounce an async search handler
 * const handleSearch = createAsyncDebouncedCallback(
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
export function createAsyncDebouncedCallback<TFn extends AnyAsyncFunction>(
  fn: TFn,
  options: AsyncDebouncerOptions<TFn>,
): (...args: Parameters<TFn>) => Promise<Awaited<ReturnType<TFn>> | undefined> {
  const debouncer = createAsyncDebouncer(fn, options)
  return (...args: Parameters<TFn>) => debouncer.maybeExecute(...args)
}
