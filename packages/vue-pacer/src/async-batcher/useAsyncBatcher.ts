import { onScopeDispose, defineComponent } from 'vue'
import { AsyncBatcher } from '@tanstack/pacer/async-batcher'
import { useStore } from '@tanstack/vue-store'
import { useDefaultPacerOptions } from '../provider/PacerProvider'
import type { Store } from '@tanstack/vue-store'
import type { Ref, DefineComponent, PropType } from 'vue'
import type {
  AsyncBatcherOptions,
  AsyncBatcherState,
} from '@tanstack/pacer/async-batcher'

export interface VueAsyncBatcher<TValue, TSelected = {}> extends Omit<
  AsyncBatcher<TValue>,
  'store'
> {
  Subscribe: DefineComponent<{
    selector: (state: AsyncBatcherState<TValue>) => any
  }>
  readonly state: Readonly<Ref<TSelected>>
  readonly store: Store<Readonly<AsyncBatcherState<TValue>>>
}

/**
 * A Vue composable that creates and manages an AsyncBatcher instance.
 *
 * This composable provides async batching functionality to collect items and process
 * them together after a specified size or wait time is reached.
 *
 * @example
 * ```vue
 * <script setup>
 * import { useAsyncBatcher } from '@tanstack/vue-pacer'
 *
 * const batcher = useAsyncBatcher<string>(
 *   async (items) => {
 *     await processBatch(items)
 *   },
 *   { maxSize: 10, wait: 1000 }
 * );
 *
 * const addToBatch = () => {
 *   batcher.addItem('new item');
 * };
 * </script>
 * ```
 */
export function useAsyncBatcher<TValue, TSelected = {}>(
  fn: (items: Array<TValue>) => Promise<any>,
  options: AsyncBatcherOptions<TValue>,
  selector: (state: AsyncBatcherState<TValue>) => TSelected = () =>
    ({}) as TSelected,
): VueAsyncBatcher<TValue, TSelected> {
  const mergedOptions = {
    ...useDefaultPacerOptions().asyncBatcher,
    ...options,
  } as AsyncBatcherOptions<TValue>

  const asyncBatcher = new AsyncBatcher<TValue>(
    fn,
    mergedOptions,
  ) as unknown as VueAsyncBatcher<TValue, TSelected>

  asyncBatcher.Subscribe = defineComponent({
    name: 'AsyncBatcherSubscribe',
    props: {
      selector: {
        type: Function as PropType<(state: AsyncBatcherState<TValue>) => any>,
        required: true,
      },
    },
    setup(props, { slots }) {
      const selected = useStore(asyncBatcher.store, props.selector)
      return () => slots.default?.(selected.value)
    },
  }) as VueAsyncBatcher<TValue, TSelected>['Subscribe']

  onScopeDispose(() => {
    asyncBatcher.cancel()
  })

  const state = useStore(asyncBatcher.store, selector)

  return {
    ...asyncBatcher,
    state,
  } as VueAsyncBatcher<TValue, TSelected>
}
