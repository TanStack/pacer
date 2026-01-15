import { ref } from 'vue'
import { useRateLimiter } from './useRateLimiter'
import type { VueRateLimiter } from './useRateLimiter'
import type { Ref } from 'vue'
import type {
  RateLimiterOptions,
  RateLimiterState,
} from '@tanstack/pacer/rate-limiter'

/**
 * A Vue composable that creates a rate-limited ref value.
 *
 * @example
 * ```vue
 * <script setup>
 * import { useRateLimitedRef } from '@tanstack/vue-pacer'
 *
 * const [rateLimitedCount, setRateLimitedCount, rateLimiter] = useRateLimitedRef(0, {
 *   limit: 5,
 *   window: 60000
 * });
 * </script>
 * ```
 */
export function useRateLimitedRef<TValue, TSelected = {}>(
  value: TValue,
  options: RateLimiterOptions<(value: TValue) => void>,
  selector?: (state: RateLimiterState<(value: TValue) => void>) => TSelected,
): [
  Readonly<Ref<TValue>>,
  (value: TValue) => void,
  VueRateLimiter<(value: TValue) => void, TSelected>,
] {
  const rateLimitedValue = ref(value) as Ref<TValue>
  const rateLimiter = useRateLimiter(
    (v: TValue) => {
      rateLimitedValue.value = v
    },
    options,
    selector,
  )
  return [rateLimitedValue, rateLimiter.maybeExecute, rateLimiter]
}
