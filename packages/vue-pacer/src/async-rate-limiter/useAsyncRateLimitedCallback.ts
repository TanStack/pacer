import { useAsyncRateLimiter } from './useAsyncRateLimiter'
import type { VueAsyncRateLimiter } from './useAsyncRateLimiter'
import type {
  AsyncRateLimiterOptions,
  AsyncRateLimiterState,
} from '@tanstack/pacer/async-rate-limiter'
import type { AnyAsyncFunction } from '@tanstack/pacer/types'

/**
 * A Vue composable that creates an async rate-limited version of a callback function.
 *
 * @example
 * ```vue
 * <script setup>
 * import { useAsyncRateLimitedCallback } from '@tanstack/vue-pacer'
 *
 * const [rateLimitedSubmit, rateLimiter] = useAsyncRateLimitedCallback(
 *   async (data) => sendApiRequest(data),
 *   { limit: 5, window: 60000 }
 * );
 * </script>
 * ```
 */
export function useAsyncRateLimitedCallback<
  TFn extends AnyAsyncFunction,
  TSelected = {},
>(
  fn: TFn,
  options: AsyncRateLimiterOptions<TFn>,
  selector?: (state: AsyncRateLimiterState<TFn>) => TSelected,
): [TFn, VueAsyncRateLimiter<TFn, TSelected>] {
  const rateLimiter = useAsyncRateLimiter(fn, options, selector)
  return [rateLimiter.maybeExecute as TFn, rateLimiter]
}
