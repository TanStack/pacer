import { onScopeDispose, defineComponent } from 'vue'
import { Queuer } from '@tanstack/pacer/queuer'
import { useStore } from '@tanstack/vue-store'
import { useDefaultPacerOptions } from '../provider/PacerProvider'
import type { Store } from '@tanstack/vue-store'
import type { Ref, DefineComponent, PropType } from 'vue'
import type { QueuerOptions, QueuerState } from '@tanstack/pacer/queuer'

export interface VueQueuer<TValue, TSelected = {}> extends Omit<
  Queuer<TValue>,
  'store'
> {
  Subscribe: DefineComponent<{
    selector: (state: QueuerState<TValue>) => any
  }>
  readonly state: Readonly<Ref<TSelected>>
  readonly store: Store<Readonly<QueuerState<TValue>>>
}

/**
 * A Vue composable that creates and manages a Queuer instance.
 *
 * This composable provides queue functionality to process items in order,
 * with support for FIFO/LIFO ordering, priority queues, and more.
 *
 * @example
 * ```vue
 * <script setup>
 * import { useQueuer } from '@tanstack/vue-pacer'
 *
 * const queue = useQueuer<string>(
 *   (item) => processItem(item),
 *   { started: true }
 * );
 *
 * const addToQueue = () => {
 *   queue.addItem('new item');
 * };
 * </script>
 * ```
 */
export function useQueuer<TValue, TSelected = {}>(
  fn: (value: TValue) => void,
  options: QueuerOptions<TValue> = {},
  selector: (state: QueuerState<TValue>) => TSelected = () => ({}) as TSelected,
): VueQueuer<TValue, TSelected> {
  const mergedOptions = {
    ...useDefaultPacerOptions().queuer,
    ...options,
  } as QueuerOptions<TValue>

  const queuer = new Queuer<TValue>(fn, mergedOptions) as unknown as VueQueuer<
    TValue,
    TSelected
  >

  queuer.Subscribe = defineComponent({
    name: 'QueuerSubscribe',
    props: {
      selector: {
        type: Function as PropType<(state: QueuerState<TValue>) => any>,
        required: true,
      },
    },
    setup(props, { slots }) {
      const selected = useStore(queuer.store, props.selector)
      return () => slots.default?.(selected.value)
    },
  }) as VueQueuer<TValue, TSelected>['Subscribe']

  onScopeDispose(() => {
    queuer.stop()
  })

  const state = useStore(queuer.store, selector)

  return {
    ...queuer,
    state,
  } as VueQueuer<TValue, TSelected>
}
