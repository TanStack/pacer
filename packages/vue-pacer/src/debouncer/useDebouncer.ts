import { onScopeDispose, defineComponent } from 'vue'
import { Debouncer } from '@tanstack/pacer/debouncer'
import { useStore } from '@tanstack/vue-store'
import { useDefaultPacerOptions } from '../provider/PacerProvider'
import type { Store } from '@tanstack/vue-store'
import type { Ref, DefineComponent, VNode, PropType } from 'vue'
import type {
  DebouncerOptions,
  DebouncerState,
} from '@tanstack/pacer/debouncer'
import type { AnyFunction } from '@tanstack/pacer/types'

export interface VueDebouncer<TFn extends AnyFunction, TSelected = {}>
  extends Omit<Debouncer<TFn>, 'store'> {
  /**
   * A Vue component that allows you to subscribe to the debouncer state.
   *
   * This is useful for opting into state re-renders for specific parts of the debouncer state
   * deep in your component tree without needing to pass a selector to the composable.
   *
   * @example
   * <debouncer.Subscribe :selector="(state) => ({ isPending: state.isPending })">
   *   <template #default="{ isPending }">
   *     <div>{{ isPending ? 'Loading...' : 'Ready' }}</div>
   *   </template>
   * </debouncer.Subscribe>
   */
  Subscribe: DefineComponent<{
    selector: (state: DebouncerState<TFn>) => any
  }>
  /**
   * Reactive state that will be updated when the debouncer state changes
   *
   * Use this instead of `debouncer.store.state`
   */
  readonly state: Readonly<Ref<TSelected>>
  /**
   * @deprecated Use `debouncer.state` instead of `debouncer.store.state` if you want to read reactive state.
   * The state on the store object is not reactive, as it has not been wrapped in a `useStore` composable internally.
   * Although, you can make the state reactive by using the `useStore` in your own usage.
   */
  readonly store: Store<Readonly<DebouncerState<TFn>>>
}

/**
 * A Vue composable that creates and manages a Debouncer instance.
 *
 * This is a lower-level composable that provides direct access to the Debouncer's functionality without
 * any built-in state management. This allows you to integrate it with any state management solution
 * you prefer (ref, reactive, Pinia, etc.).
 *
 * This composable provides debouncing functionality to limit how often a function can be called,
 * waiting for a specified delay before executing the latest call. This is useful for handling
 * frequent events like window resizing, scroll events, or real-time search inputs.
 *
 * The debouncer will only execute the function after the specified wait time has elapsed
 * since the last call. If the function is called again before the wait time expires, the
 * timer resets and starts waiting again.
 *
 * ## State Management and Selector
 *
 * The composable uses TanStack Store for reactive state management. You can subscribe to state changes
 * in two ways:
 *
 * **1. Using `debouncer.Subscribe` component (Recommended for component tree subscriptions)**
 *
 * Use the `Subscribe` component to subscribe to state changes deep in your component tree without
 * needing to pass a selector to the composable. This is ideal when you want to subscribe to state
 * in child components.
 *
 * **2. Using the `selector` parameter (For composable-level subscriptions)**
 *
 * The `selector` parameter allows you to specify which state changes will trigger a re-render
 * at the composable level, optimizing performance by preventing unnecessary re-renders when irrelevant
 * state changes occur.
 *
 * **By default, there will be no reactive state subscriptions** and you must opt-in to state
 * tracking by providing a selector function or using the `Subscribe` component. This prevents unnecessary
 * re-renders and gives you full control over when your component updates.
 *
 * Available state properties:
 * - `canLeadingExecute`: Whether the debouncer can execute on the leading edge
 * - `executionCount`: Number of function executions that have been completed
 * - `isPending`: Whether the debouncer is waiting for the timeout to trigger execution
 * - `lastArgs`: The arguments from the most recent call to maybeExecute
 * - `status`: Current execution status ('disabled' | 'idle' | 'pending')
 *
 * @example
 * ```vue
 * <script setup>
 * import { useDebouncer } from '@tanstack/vue-pacer'
 *
 * // Default behavior - no reactive state subscriptions
 * const searchDebouncer = useDebouncer(
 *   (query: string) => fetchSearchResults(query),
 *   { wait: 500 }
 * );
 *
 * // Opt-in to re-render when isPending changes at composable level
 * const searchDebouncer = useDebouncer(
 *   (query: string) => fetchSearchResults(query),
 *   { wait: 500 },
 *   (state) => ({ isPending: state.isPending })
 * );
 *
 * const handleChange = (e) => {
 *   searchDebouncer.maybeExecute(e.target.value);
 * };
 * </script>
 *
 * <template>
 *   <input @input="handleChange" />
 *   <searchDebouncer.Subscribe :selector="(state) => ({ isPending: state.isPending })">
 *     <template #default="{ isPending }">
 *       <div>{{ isPending ? 'Searching...' : 'Ready' }}</div>
 *     </template>
 *   </searchDebouncer.Subscribe>
 * </template>
 * ```
 */
export function useDebouncer<TFn extends AnyFunction, TSelected = {}>(
  fn: TFn,
  options: DebouncerOptions<TFn>,
  selector: (state: DebouncerState<TFn>) => TSelected = () => ({}) as TSelected,
): VueDebouncer<TFn, TSelected> {
  const mergedOptions = {
    ...useDefaultPacerOptions().debouncer,
    ...options,
  } as DebouncerOptions<TFn>

  const debouncer = new Debouncer(fn, mergedOptions) as unknown as VueDebouncer<
    TFn,
    TSelected
  >

  debouncer.Subscribe = defineComponent({
    name: 'DebouncerSubscribe',
    props: {
      selector: {
        type: Function as PropType<(state: DebouncerState<TFn>) => any>,
        required: true,
      },
    },
    setup(props, { slots }) {
      const selected = useStore(debouncer.store, props.selector)
      return () => slots.default?.(selected.value)
    },
  }) as VueDebouncer<TFn, TSelected>['Subscribe']

  onScopeDispose(() => {
    debouncer.cancel()
  })

  const state = useStore(debouncer.store, selector)

  return {
    ...debouncer,
    state,
  } as VueDebouncer<TFn, TSelected>
}
