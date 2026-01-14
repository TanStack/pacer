import { onScopeDispose, defineComponent } from 'vue'
import { AsyncQueuer } from '@tanstack/pacer/async-queuer'
import { useStore } from '@tanstack/vue-store'
import { useDefaultPacerOptions } from '../provider/PacerProvider'
import type { Store } from '@tanstack/vue-store'
import type { Ref, DefineComponent, PropType } from 'vue'
import type {
  AsyncQueuerOptions,
  AsyncQueuerState,
} from '@tanstack/pacer/async-queuer'

export interface VueAsyncQueuer<TValue, TSelected = {}>
  extends Omit<AsyncQueuer<TValue>, 'store'> {
  Subscribe: DefineComponent<{
    selector: (state: AsyncQueuerState<TValue>) => any
  }>
  readonly state: Readonly<Ref<TSelected>>
  readonly store: Store<Readonly<AsyncQueuerState<TValue>>>
}

/**
 * A Vue composable that creates and manages an AsyncQueuer instance.
 *
 * Features:
 * - Priority queue support via getPriority option
 * - Configurable concurrency limit
 * - Task success/error/completion callbacks
 * - FIFO (First In First Out) or LIFO (Last In First Out) queue behavior
 * - Pause/resume task processing
 * - Task cancellation
 * - Item expiration to clear stale items from the queue
 *
 * @example
 * ```vue
 * <script setup>
 * import { useAsyncQueuer } from '@tanstack/vue-pacer'
 *
 * const uploadQueuer = useAsyncQueuer<File>(
 *   async (file) => {
 *     await uploadFile(file)
 *   },
 *   { concurrency: 3, started: true }
 * );
 *
 * const handleFileSelect = (files: FileList) => {
 *   Array.from(files).forEach(file => {
 *     uploadQueuer.addItem(file)
 *   })
 * }
 * </script>
 * ```
 */
export function useAsyncQueuer<TValue, TSelected = {}>(
  fn: (value: TValue) => Promise<any>,
  options: AsyncQueuerOptions<TValue> = {},
  selector: (state: AsyncQueuerState<TValue>) => TSelected = () =>
    ({}) as TSelected,
): VueAsyncQueuer<TValue, TSelected> {
  const mergedOptions = {
    ...useDefaultPacerOptions().asyncQueuer,
    ...options,
  } as AsyncQueuerOptions<TValue>

  const asyncQueuer = new AsyncQueuer<TValue>(
    fn,
    mergedOptions,
  ) as unknown as VueAsyncQueuer<TValue, TSelected>

  asyncQueuer.Subscribe = defineComponent({
    name: 'AsyncQueuerSubscribe',
    props: {
      selector: {
        type: Function as PropType<(state: AsyncQueuerState<TValue>) => any>,
        required: true,
      },
    },
    setup(props, { slots }) {
      const selected = useStore(asyncQueuer.store, props.selector)
      return () => slots.default?.(selected.value)
    },
  }) as VueAsyncQueuer<TValue, TSelected>['Subscribe']

  onScopeDispose(() => {
    asyncQueuer.stop()
  })

  const state = useStore(asyncQueuer.store, selector)

  return {
    ...asyncQueuer,
    state,
  } as VueAsyncQueuer<TValue, TSelected>
}
