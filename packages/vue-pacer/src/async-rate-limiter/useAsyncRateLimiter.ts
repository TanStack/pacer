import { onScopeDispose, defineComponent } from 'vue'
import { AsyncRateLimiter } from '@tanstack/pacer/async-rate-limiter'
import { useStore } from '@tanstack/vue-store'
import { useDefaultPacerOptions } from '../provider/PacerProvider'
import type { Store } from '@tanstack/vue-store'
import type { Ref, DefineComponent, PropType } from 'vue'
import type {
  AsyncRateLimiterOptions,
  AsyncRateLimiterState,
} from '@tanstack/pacer/async-rate-limiter'
import type { AnyAsyncFunction } from '@tanstack/pacer/types'

export interface VueAsyncRateLimiter<
  TFn extends AnyAsyncFunction,
  TSelected = {},
> extends Omit<AsyncRateLimiter<TFn>, 'store'> {
  Subscribe: DefineComponent<{
    selector: (state: AsyncRateLimiterState<TFn>) => any
  }>
  readonly state: Readonly<Ref<TSelected>>
  readonly store: Store<Readonly<AsyncRateLimiterState<TFn>>>
}

/**
 * A Vue composable that creates and manages an AsyncRateLimiter instance.
 *
 * @example
 * ```vue
 * <script setup>
 * import { useAsyncRateLimiter } from '@tanstack/vue-pacer'
 *
 * const apiLimiter = useAsyncRateLimiter(
 *   async (data) => {
 *     await sendApiRequest(data)
 *   },
 *   { limit: 5, window: 60000 }
 * );
 * </script>
 * ```
 */
export function useAsyncRateLimiter<
  TFn extends AnyAsyncFunction,
  TSelected = {},
>(
  fn: TFn,
  options: AsyncRateLimiterOptions<TFn>,
  selector: (state: AsyncRateLimiterState<TFn>) => TSelected = () =>
    ({}) as TSelected,
): VueAsyncRateLimiter<TFn, TSelected> {
  const mergedOptions = {
    ...useDefaultPacerOptions().asyncRateLimiter,
    ...options,
  } as AsyncRateLimiterOptions<TFn>

  const asyncRateLimiter = new AsyncRateLimiter(
    fn,
    mergedOptions,
  ) as unknown as VueAsyncRateLimiter<TFn, TSelected>

  asyncRateLimiter.Subscribe = defineComponent({
    name: 'AsyncRateLimiterSubscribe',
    props: {
      selector: {
        type: Function as PropType<(state: AsyncRateLimiterState<TFn>) => any>,
        required: true,
      },
    },
    setup(props, { slots }) {
      const selected = useStore(asyncRateLimiter.store, props.selector)
      return () => slots.default?.(selected.value)
    },
  }) as VueAsyncRateLimiter<TFn, TSelected>['Subscribe']

  onScopeDispose(() => {
    asyncRateLimiter.cancel()
  })

  const state = useStore(asyncRateLimiter.store, selector)

  return {
    ...asyncRateLimiter,
    state,
  } as VueAsyncRateLimiter<TFn, TSelected>
}
