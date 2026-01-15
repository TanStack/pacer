import { onScopeDispose, defineComponent } from 'vue'
import { RateLimiter } from '@tanstack/pacer/rate-limiter'
import { useStore } from '@tanstack/vue-store'
import { useDefaultPacerOptions } from '../provider/PacerProvider'
import type { Store } from '@tanstack/vue-store'
import type { Ref, DefineComponent, PropType } from 'vue'
import type {
  RateLimiterOptions,
  RateLimiterState,
} from '@tanstack/pacer/rate-limiter'
import type { AnyFunction } from '@tanstack/pacer/types'

export interface VueRateLimiter<
  TFn extends AnyFunction,
  TSelected = {},
> extends Omit<RateLimiter<TFn>, 'store'> {
  Subscribe: DefineComponent<{
    selector: (state: RateLimiterState<TFn>) => any
  }>
  readonly state: Readonly<Ref<TSelected>>
  readonly store: Store<Readonly<RateLimiterState<TFn>>>
}

/**
 * A Vue composable that creates and manages a RateLimiter instance.
 *
 * This composable provides rate limiting functionality to restrict how many times
 * a function can be called within a specified time window. This is useful for
 * API calls, form submissions, or any action that should be limited.
 *
 * @example
 * ```vue
 * <script setup>
 * import { useRateLimiter } from '@tanstack/vue-pacer'
 *
 * const apiLimiter = useRateLimiter(
 *   (data) => sendApiRequest(data),
 *   { limit: 5, window: 60000 }
 * );
 *
 * const handleSubmit = () => {
 *   apiLimiter.maybeExecute(formData);
 * };
 * </script>
 * ```
 */
export function useRateLimiter<TFn extends AnyFunction, TSelected = {}>(
  fn: TFn,
  options: RateLimiterOptions<TFn>,
  selector: (state: RateLimiterState<TFn>) => TSelected = () =>
    ({}) as TSelected,
): VueRateLimiter<TFn, TSelected> {
  const mergedOptions = {
    ...useDefaultPacerOptions().rateLimiter,
    ...options,
  } as RateLimiterOptions<TFn>

  const rateLimiter = new RateLimiter(
    fn,
    mergedOptions,
  ) as unknown as VueRateLimiter<TFn, TSelected>

  rateLimiter.Subscribe = defineComponent({
    name: 'RateLimiterSubscribe',
    props: {
      selector: {
        type: Function as PropType<(state: RateLimiterState<TFn>) => any>,
        required: true,
      },
    },
    setup(props, { slots }) {
      const selected = useStore(rateLimiter.store, props.selector)
      return () => slots.default?.(selected.value)
    },
  }) as VueRateLimiter<TFn, TSelected>['Subscribe']

  onScopeDispose(() => {
    rateLimiter.cancel()
  })

  const state = useStore(rateLimiter.store, selector)

  return {
    ...rateLimiter,
    state,
  } as VueRateLimiter<TFn, TSelected>
}
