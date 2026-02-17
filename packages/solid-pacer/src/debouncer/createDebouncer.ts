import { Debouncer } from '@tanstack/pacer/debouncer'
import { createEffect, onCleanup } from 'solid-js'
import { useStore } from '@tanstack/solid-store'
import { useDefaultPacerOptions } from '../provider/PacerProvider'
import type { Store } from '@tanstack/solid-store'
import type { Accessor, JSX } from 'solid-js'
import type { AnyFunction } from '@tanstack/pacer/types'
import type {
  DebouncerOptions,
  DebouncerState,
} from '@tanstack/pacer/debouncer'

export interface SolidDebouncerOptions<
  TFn extends AnyFunction,
  TSelected = {},
> extends DebouncerOptions<TFn> {
  /**
   * Optional callback invoked when the owning component unmounts. Receives the debouncer instance.
   * When provided, replaces the default cleanup (cancel); use it to call flush(), cancel(), add logging, etc.
   */
  onUnmount?: (debouncer: SolidDebouncer<TFn, TSelected>) => void
}

export interface SolidDebouncer<
  TFn extends AnyFunction,
  TSelected = {},
> extends Omit<Debouncer<TFn>, 'store'> {
  /**
   * A Solid component that allows you to subscribe to the debouncer state.
   *
   * This is useful for tracking specific parts of the debouncer state
   * deep in your component tree without needing to pass a selector to the hook.
   *
   * @example
   * <debouncer.Subscribe selector={(state) => ({ isPending: state.isPending })}>
   *   {(state) => (
   *     <div>{state().isPending ? 'Waiting...' : 'Ready'}</div>
   *   )}
   * </debouncer.Subscribe>
   */
  Subscribe: <TSelected>(props: {
    selector: (state: DebouncerState<TFn>) => TSelected
    children: ((state: Accessor<TSelected>) => JSX.Element) | JSX.Element
  }) => JSX.Element
  /**
   * Reactive state that will be updated when the debouncer state changes
   *
   * Use this instead of `debouncer.store.state`
   */
  readonly state: Accessor<Readonly<TSelected>>
  /**
   * @deprecated Use `debouncer.state` instead of `debouncer.store.state` if you want to read reactive state.
   * The state on the store object is not reactive, as it has not been wrapped in a `useStore` hook internally.
   * Although, you can make the state reactive by using the `useStore` in your own usage.
   */
  readonly store: Store<Readonly<DebouncerState<TFn>>>
}

/**
 * A Solid hook that creates and manages a Debouncer instance.
 *
 * This is a lower-level hook that provides direct access to the Debouncer's functionality without
 * any built-in state management. This allows you to integrate it with any state management solution
 * you prefer (createSignal, Redux, Zustand, etc.).
 *
 * This hook provides debouncing functionality to limit how often a function can be called,
 * waiting for a specified delay before executing the latest call. This is useful for handling
 * frequent events like window resizing, scroll events, or real-time search inputs.
 *
 * The debouncer will only execute the function after the specified wait time has elapsed
 * since the last call. If the function is called again before the wait time expires, the
 * timer resets and starts waiting again.
 *
 * ## State Management and Selector
 *
 * The hook uses TanStack Store for reactive state management. You can subscribe to state changes
 * in two ways:
 *
 * **1. Using `debouncer.Subscribe` component (Recommended for component tree subscriptions)**
 *
 * Use the `Subscribe` component to subscribe to state changes deep in your component tree without
 * needing to pass a selector to the hook. This is ideal when you want to subscribe to state
 * in child components.
 *
 * **2. Using the `selector` parameter (For hook-level subscriptions)**
 *
 * The `selector` parameter allows you to specify which state changes will trigger reactive updates
 * at the hook level, optimizing performance by preventing unnecessary updates when irrelevant
 * state changes occur.
 *
 * **By default, there will be no reactive state subscriptions** and you must opt-in to state
 * tracking by providing a selector function or using the `Subscribe` component. This prevents unnecessary
 * updates and gives you full control over when your component tracks state changes.
 *
 * Available state properties:
 * - `canLeadingExecute`: Whether the debouncer can execute on the leading edge
 * - `executionCount`: Number of function executions that have been completed
 * - `isPending`: Whether the debouncer is waiting for the timeout to trigger execution
 * - `lastArgs`: The arguments from the most recent call to maybeExecute
 * - `status`: Current execution status ('disabled' | 'idle' | 'pending')
 *
 * ## Unmount behavior
 *
 * By default, the primitive cancels any pending execution when the owning component unmounts.
 * Use the `onUnmount` option to customize this. For example, to flush pending work instead:
 *
 * ```tsx
 * const debouncer = createDebouncer(fn, {
 *   wait: 500,
 *   onUnmount: (d) => d.flush()
 * });
 * ```
 *
 * @example
 * ```tsx
 * // Default behavior - no reactive state subscriptions
 * const debouncer = createDebouncer(
 *   (query: string) => fetchSearchResults(query),
 *   { wait: 500 }
 * );
 *
 * // Opt-in to track isPending changes (optimized for loading states)
 * const debouncer = createDebouncer(
 *   (query: string) => fetchSearchResults(query),
 *   { wait: 500 },
 *   (state) => ({ isPending: state.isPending })
 * );
 *
 * // Opt-in to track executionCount changes (optimized for tracking execution)
 * const debouncer = createDebouncer(
 *   (query: string) => fetchSearchResults(query),
 *   { wait: 500 },
 *   (state) => ({ executionCount: state.executionCount })
 * );
 *
 * // Multiple state properties - track when any of these change
 * const debouncer = createDebouncer(
 *   (query: string) => fetchSearchResults(query),
 *   { wait: 500 },
 *   (state) => ({
 *     isPending: state.isPending,
 *     executionCount: state.executionCount,
 *     status: state.status
 *   })
 * );
 *
 * // In an event handler
 * const handleChange = (e) => {
 *   debouncer.maybeExecute(e.target.value);
 * };
 *
 * // Access the selected state (will be empty object {} unless selector provided)
 * const { isPending } = debouncer.state();
 * ```
 */
export function createDebouncer<TFn extends AnyFunction, TSelected = {}>(
  fn: TFn,
  options: SolidDebouncerOptions<TFn, TSelected>,
  selector: (state: DebouncerState<TFn>) => TSelected = () => ({}) as TSelected,
): SolidDebouncer<TFn, TSelected> {
  const mergedOptions = {
    ...useDefaultPacerOptions().debouncer,
    ...options,
  } as SolidDebouncerOptions<TFn, TSelected>
  const asyncDebouncer = new Debouncer<TFn>(
    fn,
    mergedOptions,
  ) as unknown as SolidDebouncer<TFn, TSelected>

  asyncDebouncer.Subscribe = function Subscribe<TSelected>(props: {
    selector: (state: DebouncerState<TFn>) => TSelected
    children: ((state: Accessor<TSelected>) => JSX.Element) | JSX.Element
  }) {
    const selected = useStore(asyncDebouncer.store, props.selector)

    return typeof props.children === 'function'
      ? props.children(selected)
      : props.children
  }

  const state = useStore(asyncDebouncer.store, selector)

  createEffect(() => {
    onCleanup(() => {
      if (mergedOptions.onUnmount) {
        mergedOptions.onUnmount(asyncDebouncer)
      } else {
        asyncDebouncer.cancel()
      }
    })
  })

  return {
    ...asyncDebouncer,
    state,
  } as SolidDebouncer<TFn, TSelected> // omit `store` in favor of `state`
}
