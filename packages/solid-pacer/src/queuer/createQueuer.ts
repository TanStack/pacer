import { Queuer } from '@tanstack/pacer/queuer'
import { useStore } from '@tanstack/solid-store'
import { createEffect, onCleanup } from 'solid-js'
import { useDefaultPacerOptions } from '../provider/PacerProvider'
import type { Store } from '@tanstack/solid-store'
import type { Accessor, JSX } from 'solid-js'
import type { QueuerOptions, QueuerState } from '@tanstack/pacer/queuer'

export interface SolidQueuerOptions<
  TValue,
  TSelected = {},
> extends QueuerOptions<TValue> {
  /**
   * Optional callback invoked when the owning component unmounts. Receives the queuer instance.
   * When provided, replaces the default cleanup (stop); use it to call flush(), stop(), add logging, etc.
   */
  onUnmount?: (queuer: SolidQueuer<TValue, TSelected>) => void
}

export interface SolidQueuer<TValue, TSelected = {}> extends Omit<
  Queuer<TValue>,
  'store'
> {
  /**
   * A Solid component that allows you to subscribe to the queuer state.
   *
   * This is useful for tracking specific parts of the queuer state
   * deep in your component tree without needing to pass a selector to the hook.
   *
   * @example
   * <queuer.Subscribe selector={(state) => ({ size: state.size, isRunning: state.isRunning })}>
   *   {(state) => (
   *     <div>Queue: {state().size} items, {state().isRunning ? 'Processing' : 'Idle'}</div>
   *   )}
   * </queuer.Subscribe>
   */
  Subscribe: <TSelected>(props: {
    selector: (state: QueuerState<TValue>) => TSelected
    children: ((state: Accessor<TSelected>) => JSX.Element) | JSX.Element
  }) => JSX.Element
  /**
   * Reactive state that will be updated when the queuer state changes
   *
   * Use this instead of `queuer.store.state`
   */
  readonly state: Accessor<Readonly<TSelected>>
  /**
   * @deprecated Use `queuer.state` instead of `queuer.store.state` if you want to read reactive state.
   * The state on the store object is not reactive, as it has not been wrapped in a `useStore` hook internally.
   * Although, you can make the state reactive by using the `useStore` in your own usage.
   */
  readonly store: Store<Readonly<QueuerState<TValue>>>
}

/**
 * Creates a Solid-compatible Queuer instance for managing a synchronous queue of items, exposing Solid signals for all stateful properties.
 *
 * Features:
 * - Synchronous processing of items using the provided `fn` function
 * - FIFO (First In First Out) or LIFO (Last In First Out) queue behavior
 * - Priority queueing via `getPriority` or item `priority` property
 * - Item expiration and removal of stale items
 * - Configurable wait time between processing items
 * - Pause/resume processing
 * - Callbacks for queue state changes, execution, rejection, and expiration
 * - All stateful properties (items, counts, etc.) are exposed as Solid signals for reactivity
 *
 * The queue processes items synchronously in order, with optional delays between each item. When started, it will process one item per tick, with an optional wait time between ticks. You can pause and resume processing with `stop()` and `start()`.
 *
 * By default, the queue uses FIFO behavior, but you can configure LIFO or double-ended queueing by specifying the position when adding or removing items.
 *
 * ## State Management and Selector
 *
 * The hook uses TanStack Store for reactive state management. You can subscribe to state changes
 * in two ways:
 *
 * **1. Using `queuer.Subscribe` component (Recommended for component tree subscriptions)**
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
 * - `executionCount`: Number of items that have been processed
 * - `isRunning`: Whether the queuer is currently running (not stopped)
 * - `items`: Array of items currently queued for processing
 * - `rejectionCount`: Number of items that were rejected (expired or failed validation)
 *
 * ## Unmount behavior
 *
 * By default, the primitive stops the queuer when the owning component unmounts.
 * Use the `onUnmount` option to customize this. For example, to flush pending items instead:
 *
 * ```tsx
 * const queue = createQueuer(fn, {
 *   started: true,
 *   wait: 1000,
 *   onUnmount: (q) => q.flush()
 * });
 * ```
 *
 * Example usage:
 * ```tsx
 * // Default behavior - no reactive state subscriptions
 * const queue = createQueuer(
 *   (item) => {
 *     // process item synchronously
 *     console.log('Processing', item);
 *   },
 *   {
 *     started: true, // Start processing immediately
 *     wait: 1000,    // Process one item every second
 *     getPriority: (item) => item.priority // Process higher priority items first
 *   }
 * );
 *
 * // Opt-in to track items or isRunning changes (optimized for UI updates)
 * const queue = createQueuer(
 *   (item) => console.log('Processing', item),
 *   { started: true, wait: 1000 },
 *   (state) => ({ items: state.items, isRunning: state.isRunning })
 * );
 *
 * // Opt-in to track execution metrics changes (optimized for tracking progress)
 * const queue = createQueuer(
 *   (item) => console.log('Processing', item),
 *   { started: true, wait: 1000 },
 *   (state) => ({
 *     executionCount: state.executionCount,
 *     rejectionCount: state.rejectionCount
 *   })
 * );
 *
 * // Add items to process - they'll be handled automatically
 * queue.addItem('task1');
 * queue.addItem('task2');
 *
 * // Control the scheduler
 * queue.stop();  // Pause processing
 * queue.start(); // Resume processing
 *
 * // Access the selected state (will be empty object {} unless selector provided)
 * const { items, isRunning } = queue.state();
 * ```
 */
export function createQueuer<TValue, TSelected = {}>(
  fn: (item: TValue) => void,
  options: SolidQueuerOptions<TValue, TSelected> = {},
  selector: (state: QueuerState<TValue>) => TSelected = () => ({}) as TSelected,
): SolidQueuer<TValue, TSelected> {
  const mergedOptions = {
    ...useDefaultPacerOptions().queuer,
    ...options,
  } as SolidQueuerOptions<TValue, TSelected>
  const queuer = new Queuer(fn, mergedOptions) as unknown as SolidQueuer<
    TValue,
    TSelected
  >

  queuer.Subscribe = function Subscribe<TSelected>(props: {
    selector: (state: QueuerState<TValue>) => TSelected
    children: ((state: Accessor<TSelected>) => JSX.Element) | JSX.Element
  }) {
    const selected = useStore(queuer.store, props.selector)

    return typeof props.children === 'function'
      ? props.children(selected)
      : props.children
  }

  const state = useStore(queuer.store, selector)

  createEffect(() => {
    onCleanup(() => {
      if (mergedOptions.onUnmount) {
        mergedOptions.onUnmount(queuer)
      } else {
        queuer.stop()
      }
    })
  })

  return {
    ...queuer,
    state,
  } as SolidQueuer<TValue, TSelected> // omit `store` in favor of `state`
}
