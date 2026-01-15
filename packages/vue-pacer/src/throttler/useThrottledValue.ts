import { ref, watch, toValue } from 'vue'
import { useThrottler } from './useThrottler'
import type { VueThrottler } from './useThrottler'
import type { Ref, MaybeRefOrGetter } from 'vue'
import type {
  ThrottlerOptions,
  ThrottlerState,
} from '@tanstack/pacer/throttler'

/**
 * A Vue composable that creates a throttled version of a reactive value.
 *
 * @example
 * ```vue
 * <script setup>
 * import { ref } from 'vue'
 * import { useThrottledValue } from '@tanstack/vue-pacer'
 *
 * const scrollPosition = ref(0)
 * const [throttledPosition, throttler] = useThrottledValue(scrollPosition, {
 *   wait: 100
 * });
 * </script>
 * ```
 */
export function useThrottledValue<TValue, TSelected = {}>(
  value: MaybeRefOrGetter<TValue>,
  options: ThrottlerOptions<(value: TValue) => void>,
  selector?: (state: ThrottlerState<(value: TValue) => void>) => TSelected,
): [Readonly<Ref<TValue>>, VueThrottler<(value: TValue) => void, TSelected>] {
  const throttledValue = ref(toValue(value)) as Ref<TValue>
  const throttler = useThrottler(
    (v: TValue) => {
      throttledValue.value = v
    },
    options,
    selector,
  )

  watch(
    () => toValue(value),
    (newValue) => {
      throttler.maybeExecute(newValue)
    },
  )

  return [throttledValue, throttler]
}
