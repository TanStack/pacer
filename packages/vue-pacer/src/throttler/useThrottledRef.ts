import { ref } from 'vue'
import { useThrottler } from './useThrottler'
import type { VueThrottler } from './useThrottler'
import type { Ref } from 'vue'
import type {
  ThrottlerOptions,
  ThrottlerState,
} from '@tanstack/pacer/throttler'

/**
 * A Vue composable that creates a throttled ref value.
 *
 * @example
 * ```vue
 * <script setup>
 * import { ref } from 'vue'
 * import { useThrottledRef } from '@tanstack/vue-pacer'
 *
 * const [throttledPosition, setThrottledPosition, throttler] = useThrottledRef(0, {
 *   wait: 100
 * });
 *
 * const handleScroll = (e) => {
 *   setThrottledPosition(window.scrollY)
 * };
 * </script>
 * ```
 */
export function useThrottledRef<TValue, TSelected = {}>(
  value: TValue,
  options: ThrottlerOptions<(value: TValue) => void>,
  selector?: (state: ThrottlerState<(value: TValue) => void>) => TSelected,
): [
  Readonly<Ref<TValue>>,
  (value: TValue) => void,
  VueThrottler<(value: TValue) => void, TSelected>,
] {
  const throttledValue = ref(value) as Ref<TValue>
  const throttler = useThrottler(
    (v: TValue) => {
      throttledValue.value = v
    },
    options,
    selector,
  )
  return [throttledValue, throttler.maybeExecute, throttler]
}
