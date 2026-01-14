import { onScopeDispose, defineComponent } from 'vue'
import { Throttler } from '@tanstack/pacer/throttler'
import { useStore } from '@tanstack/vue-store'
import { useDefaultPacerOptions } from '../provider/PacerProvider'
import type { Store } from '@tanstack/vue-store'
import type { Ref, DefineComponent, PropType } from 'vue'
import type {
  ThrottlerOptions,
  ThrottlerState,
} from '@tanstack/pacer/throttler'
import type { AnyFunction } from '@tanstack/pacer/types'

export interface VueThrottler<TFn extends AnyFunction, TSelected = {}>
  extends Omit<Throttler<TFn>, 'store'> {
  Subscribe: DefineComponent<{
    selector: (state: ThrottlerState<TFn>) => any
  }>
  readonly state: Readonly<Ref<TSelected>>
  readonly store: Store<Readonly<ThrottlerState<TFn>>>
}

/**
 * A Vue composable that creates and manages a Throttler instance.
 *
 * This composable provides throttling functionality to limit how often a function can be called.
 * Unlike debouncing, throttling ensures the function executes at a regular interval,
 * making it ideal for rate-limiting continuous events like scroll or resize handlers.
 *
 * @example
 * ```vue
 * <script setup>
 * import { useThrottler } from '@tanstack/vue-pacer'
 *
 * const scrollThrottler = useThrottler(
 *   () => updateScrollPosition(),
 *   { wait: 100 }
 * );
 *
 * const handleScroll = () => {
 *   scrollThrottler.maybeExecute();
 * };
 * </script>
 * ```
 */
export function useThrottler<TFn extends AnyFunction, TSelected = {}>(
  fn: TFn,
  options: ThrottlerOptions<TFn>,
  selector: (state: ThrottlerState<TFn>) => TSelected = () => ({}) as TSelected,
): VueThrottler<TFn, TSelected> {
  const mergedOptions = {
    ...useDefaultPacerOptions().throttler,
    ...options,
  } as ThrottlerOptions<TFn>

  const throttler = new Throttler(fn, mergedOptions) as unknown as VueThrottler<
    TFn,
    TSelected
  >

  throttler.Subscribe = defineComponent({
    name: 'ThrottlerSubscribe',
    props: {
      selector: {
        type: Function as PropType<(state: ThrottlerState<TFn>) => any>,
        required: true,
      },
    },
    setup(props, { slots }) {
      const selected = useStore(throttler.store, props.selector)
      return () => slots.default?.(selected.value)
    },
  }) as VueThrottler<TFn, TSelected>['Subscribe']

  onScopeDispose(() => {
    throttler.cancel()
  })

  const state = useStore(throttler.store, selector)

  return {
    ...throttler,
    state,
  } as VueThrottler<TFn, TSelected>
}
