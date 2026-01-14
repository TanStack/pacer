import { onScopeDispose, defineComponent } from 'vue'
import { AsyncThrottler } from '@tanstack/pacer/async-throttler'
import { useStore } from '@tanstack/vue-store'
import { useDefaultPacerOptions } from '../provider/PacerProvider'
import type { Store } from '@tanstack/vue-store'
import type { Ref, DefineComponent, PropType } from 'vue'
import type {
  AsyncThrottlerOptions,
  AsyncThrottlerState,
} from '@tanstack/pacer/async-throttler'
import type { AnyAsyncFunction } from '@tanstack/pacer/types'

export interface VueAsyncThrottler<TFn extends AnyAsyncFunction, TSelected = {}>
  extends Omit<AsyncThrottler<TFn>, 'store'> {
  Subscribe: DefineComponent<{
    selector: (state: AsyncThrottlerState<TFn>) => any
  }>
  readonly state: Readonly<Ref<TSelected>>
  readonly store: Store<Readonly<AsyncThrottlerState<TFn>>>
}

/**
 * A Vue composable that creates and manages an AsyncThrottler instance.
 *
 * @example
 * ```vue
 * <script setup>
 * import { useAsyncThrottler } from '@tanstack/vue-pacer'
 *
 * const scrollThrottler = useAsyncThrottler(
 *   async () => {
 *     await saveScrollPosition()
 *   },
 *   { wait: 100 }
 * );
 * </script>
 * ```
 */
export function useAsyncThrottler<TFn extends AnyAsyncFunction, TSelected = {}>(
  fn: TFn,
  options: AsyncThrottlerOptions<TFn>,
  selector: (state: AsyncThrottlerState<TFn>) => TSelected = () =>
    ({}) as TSelected,
): VueAsyncThrottler<TFn, TSelected> {
  const mergedOptions = {
    ...useDefaultPacerOptions().asyncThrottler,
    ...options,
  } as AsyncThrottlerOptions<TFn>

  const asyncThrottler = new AsyncThrottler(
    fn,
    mergedOptions,
  ) as unknown as VueAsyncThrottler<TFn, TSelected>

  asyncThrottler.Subscribe = defineComponent({
    name: 'AsyncThrottlerSubscribe',
    props: {
      selector: {
        type: Function as PropType<(state: AsyncThrottlerState<TFn>) => any>,
        required: true,
      },
    },
    setup(props, { slots }) {
      const selected = useStore(asyncThrottler.store, props.selector)
      return () => slots.default?.(selected.value)
    },
  }) as VueAsyncThrottler<TFn, TSelected>['Subscribe']

  onScopeDispose(() => {
    asyncThrottler.cancel()
  })

  const state = useStore(asyncThrottler.store, selector)

  return {
    ...asyncThrottler,
    state,
  } as VueAsyncThrottler<TFn, TSelected>
}
