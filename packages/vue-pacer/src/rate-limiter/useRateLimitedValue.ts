import { ref, watch, toValue } from 'vue'
import { useRateLimiter } from './useRateLimiter'
import type { VueRateLimiter } from './useRateLimiter'
import type { Ref, MaybeRefOrGetter } from 'vue'
import type {
  RateLimiterOptions,
  RateLimiterState,
} from '@tanstack/pacer/rate-limiter'

/**
 * A Vue composable that creates a rate-limited version of a reactive value.
 *
 * @example
 * ```vue
 * <script setup>
 * import { ref } from 'vue'
 * import { useRateLimitedValue } from '@tanstack/vue-pacer'
 *
 * const clickCount = ref(0)
 * const [rateLimitedCount, rateLimiter] = useRateLimitedValue(clickCount, {
 *   limit: 5,
 *   window: 60000
 * });
 * </script>
 * ```
 */
export function useRateLimitedValue<TValue, TSelected = {}>(
  value: MaybeRefOrGetter<TValue>,
  options: RateLimiterOptions<(value: TValue) => void>,
  selector?: (state: RateLimiterState<(value: TValue) => void>) => TSelected,
): [Readonly<Ref<TValue>>, VueRateLimiter<(value: TValue) => void, TSelected>] {
  const rateLimitedValue = ref(toValue(value)) as Ref<TValue>
  const rateLimiter = useRateLimiter(
    (v: TValue) => {
      rateLimitedValue.value = v
    },
    options,
    selector,
  )

  watch(
    () => toValue(value),
    (newValue) => {
      rateLimiter.maybeExecute(newValue)
    },
  )

  return [rateLimitedValue, rateLimiter]
}
