import { useAsyncThrottler } from './useAsyncThrottler'
import type { VueAsyncThrottler } from './useAsyncThrottler'
import type {
  AsyncThrottlerOptions,
  AsyncThrottlerState,
} from '@tanstack/pacer/async-throttler'
import type { AnyAsyncFunction } from '@tanstack/pacer/types'

/**
 * A Vue composable that creates an async throttled version of a callback function.
 *
 * @example
 * ```vue
 * <script setup>
 * import { useAsyncThrottledCallback } from '@tanstack/vue-pacer'
 *
 * const [throttledSave, throttler] = useAsyncThrottledCallback(
 *   async () => saveToServer(),
 *   { wait: 100 }
 * );
 * </script>
 * ```
 */
export function useAsyncThrottledCallback<
  TFn extends AnyAsyncFunction,
  TSelected = {},
>(
  fn: TFn,
  options: AsyncThrottlerOptions<TFn>,
  selector?: (state: AsyncThrottlerState<TFn>) => TSelected,
): [TFn, VueAsyncThrottler<TFn, TSelected>] {
  const throttler = useAsyncThrottler(fn, options, selector)
  return [throttler.maybeExecute as TFn, throttler]
}
