import { useThrottler } from './useThrottler'
import type { VueThrottler } from './useThrottler'
import type {
  ThrottlerOptions,
  ThrottlerState,
} from '@tanstack/pacer/throttler'
import type { AnyFunction } from '@tanstack/pacer/types'

/**
 * A Vue composable that creates a throttled version of a callback function.
 *
 * @example
 * ```vue
 * <script setup>
 * import { useThrottledCallback } from '@tanstack/vue-pacer'
 *
 * const [throttledScroll, throttler] = useThrottledCallback(
 *   () => updateScrollPosition(),
 *   { wait: 100 }
 * );
 * </script>
 * ```
 */
export function useThrottledCallback<TFn extends AnyFunction, TSelected = {}>(
  fn: TFn,
  options: ThrottlerOptions<TFn>,
  selector?: (state: ThrottlerState<TFn>) => TSelected,
): [TFn, VueThrottler<TFn, TSelected>] {
  const throttler = useThrottler(fn, options, selector)
  return [throttler.maybeExecute as TFn, throttler]
}
