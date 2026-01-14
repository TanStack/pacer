import { onScopeDispose, defineComponent } from 'vue'
import { Batcher } from '@tanstack/pacer/batcher'
import { useStore } from '@tanstack/vue-store'
import { useDefaultPacerOptions } from '../provider/PacerProvider'
import type { Store } from '@tanstack/vue-store'
import type { Ref, DefineComponent, PropType } from 'vue'
import type { BatcherOptions, BatcherState } from '@tanstack/pacer/batcher'

export interface VueBatcher<TValue, TSelected = {}> extends Omit<
  Batcher<TValue>,
  'store'
> {
  Subscribe: DefineComponent<{
    selector: (state: BatcherState<TValue>) => any
  }>
  readonly state: Readonly<Ref<TSelected>>
  readonly store: Store<Readonly<BatcherState<TValue>>>
}

/**
 * A Vue composable that creates and manages a Batcher instance.
 *
 * This composable provides batching functionality to collect items and process
 * them together after a specified size or wait time is reached.
 *
 * @example
 * ```vue
 * <script setup>
 * import { useBatcher } from '@tanstack/vue-pacer'
 *
 * const batcher = useBatcher<string>(
 *   (items) => processBatch(items),
 *   { maxSize: 10, wait: 1000 }
 * );
 *
 * const addToBatch = () => {
 *   batcher.addItem('new item');
 * };
 * </script>
 * ```
 */
export function useBatcher<TValue, TSelected = {}>(
  fn: (items: Array<TValue>) => void,
  options: BatcherOptions<TValue>,
  selector: (state: BatcherState<TValue>) => TSelected = () =>
    ({}) as TSelected,
): VueBatcher<TValue, TSelected> {
  const mergedOptions = {
    ...useDefaultPacerOptions().batcher,
    ...options,
  } as BatcherOptions<TValue>

  const batcher = new Batcher<TValue>(
    fn,
    mergedOptions,
  ) as unknown as VueBatcher<TValue, TSelected>

  batcher.Subscribe = defineComponent({
    name: 'BatcherSubscribe',
    props: {
      selector: {
        type: Function as PropType<(state: BatcherState<TValue>) => any>,
        required: true,
      },
    },
    setup(props, { slots }) {
      const selected = useStore(batcher.store, props.selector)
      return () => slots.default?.(selected.value)
    },
  }) as VueBatcher<TValue, TSelected>['Subscribe']

  onScopeDispose(() => {
    batcher.cancel()
  })

  const state = useStore(batcher.store, selector)

  return {
    ...batcher,
    state,
  } as VueBatcher<TValue, TSelected>
}
