import { useRateLimiter } from './useRateLimiter'
import type { VueRateLimiter } from './useRateLimiter'
import type {
  RateLimiterOptions,
  RateLimiterState,
} from '@tanstack/pacer/rate-limiter'
import type { AnyFunction } from '@tanstack/pacer/types'

/**
 * A Vue composable that creates a rate-limited version of a callback function.
 *
 * @example
 * ```vue
 * <script setup>
 * import { useRateLimitedCallback } from '@tanstack/vue-pacer'
 *
 * const [rateLimitedSubmit, rateLimiter] = useRateLimitedCallback(
 *   (data) => sendApiRequest(data),
 *   { limit: 5, window: 60000 }
 * );
 * </script>
 * ```
 */
export function useRateLimitedCallback<TFn extends AnyFunction, TSelected = {}>(
  fn: TFn,
  options: RateLimiterOptions<TFn>,
  selector?: (state: RateLimiterState<TFn>) => TSelected,
): [TFn, VueRateLimiter<TFn, TSelected>] {
  const rateLimiter = useRateLimiter(fn, options, selector)
  return [rateLimiter.maybeExecute as TFn, rateLimiter]
}
