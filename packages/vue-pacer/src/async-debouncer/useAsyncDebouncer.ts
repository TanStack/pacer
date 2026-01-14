import { onScopeDispose, defineComponent } from 'vue'
import { AsyncDebouncer } from '@tanstack/pacer/async-debouncer'
import { useStore } from '@tanstack/vue-store'
import { useDefaultPacerOptions } from '../provider/PacerProvider'
import type { Store } from '@tanstack/vue-store'
import type { Ref, DefineComponent, PropType } from 'vue'
import type {
  AsyncDebouncerOptions,
  AsyncDebouncerState,
} from '@tanstack/pacer/async-debouncer'
import type { AnyAsyncFunction } from '@tanstack/pacer/types'

export interface VueAsyncDebouncer<TFn extends AnyAsyncFunction, TSelected = {}>
  extends Omit<AsyncDebouncer<TFn>, 'store'> {
  Subscribe: DefineComponent<{
    selector: (state: AsyncDebouncerState<TFn>) => any
  }>
  readonly state: Readonly<Ref<TSelected>>
  readonly store: Store<Readonly<AsyncDebouncerState<TFn>>>
}

/**
 * A Vue composable that creates and manages an AsyncDebouncer instance.
 *
 * This composable provides debouncing functionality for async functions,
 * with support for cancellation and promise-based execution tracking.
 *
 * @example
 * ```vue
 * <script setup>
 * import { useAsyncDebouncer } from '@tanstack/vue-pacer'
 *
 * const searchDebouncer = useAsyncDebouncer(
 *   async (query: string) => {
 *     const results = await fetchSearchResults(query)
 *     return results
 *   },
 *   { wait: 500 }
 * );
 *
 * const handleSearch = (e) => {
 *   searchDebouncer.maybeExecute(e.target.value);
 * };
 * </script>
 * ```
 */
export function useAsyncDebouncer<TFn extends AnyAsyncFunction, TSelected = {}>(
  fn: TFn,
  options: AsyncDebouncerOptions<TFn>,
  selector: (state: AsyncDebouncerState<TFn>) => TSelected = () =>
    ({}) as TSelected,
): VueAsyncDebouncer<TFn, TSelected> {
  const mergedOptions = {
    ...useDefaultPacerOptions().asyncDebouncer,
    ...options,
  } as AsyncDebouncerOptions<TFn>

  const asyncDebouncer = new AsyncDebouncer(
    fn,
    mergedOptions,
  ) as unknown as VueAsyncDebouncer<TFn, TSelected>

  asyncDebouncer.Subscribe = defineComponent({
    name: 'AsyncDebouncerSubscribe',
    props: {
      selector: {
        type: Function as PropType<(state: AsyncDebouncerState<TFn>) => any>,
        required: true,
      },
    },
    setup(props, { slots }) {
      const selected = useStore(asyncDebouncer.store, props.selector)
      return () => slots.default?.(selected.value)
    },
  }) as VueAsyncDebouncer<TFn, TSelected>['Subscribe']

  onScopeDispose(() => {
    asyncDebouncer.cancel()
  })

  const state = useStore(asyncDebouncer.store, selector)

  return {
    ...asyncDebouncer,
    state,
  } as VueAsyncDebouncer<TFn, TSelected>
}
