import { signal, Signal } from '@angular/core'
import { DestroyRef, inject } from '@angular/core'
import { Batcher } from '@tanstack/pacer/batcher'
import { useDefaultPacerOptions } from '../provider/pacer-context'
import type { Store } from '@tanstack/store'
import type { BatcherOptions, BatcherState } from '@tanstack/pacer/batcher'

export interface AngularBatcher<TValue, TSelected = {}> extends Omit<
  Batcher<TValue>,
  'store'
> {
  /**
   * Reactive state signal that will be updated when the batcher state changes
   *
   * Use this instead of `batcher.store.state`
   */
  readonly state: Signal<Readonly<TSelected>>
  /**
   * @deprecated Use `batcher.state` instead of `batcher.store.state` if you want to read reactive state.
   * The state on the store object is not reactive in Angular signals.
   */
  readonly store: Store<Readonly<BatcherState<TValue>>>
}

/**
 * An Angular function that creates and manages a Batcher instance.
 *
 * This is a lower-level function that provides direct access to the Batcher's functionality.
 * This allows you to integrate it with any state management solution you prefer.
 *
 * The Batcher collects items and processes them in batches based on configurable conditions:
 * - Maximum batch size
 * - Time-based batching (process after X milliseconds)
 * - Custom batch processing logic via getShouldExecute
 *
 * ## State Management and Selector
 *
 * The function uses TanStack Store for state management and wraps it with Angular signals.
 * The `selector` parameter allows you to specify which state changes will trigger signal updates,
 * optimizing performance by preventing unnecessary updates when irrelevant state changes occur.
 *
 * **By default, there will be no reactive state subscriptions** and you must opt-in to state
 * tracking by providing a selector function. This prevents unnecessary updates and gives you
 * full control over when your component tracks state changes.
 *
 * @example
 * ```ts
 * // Default behavior - no reactive state subscriptions
 * const batcher = createBatcher(
 *   (items) => console.log('Processing batch:', items),
 *   { maxSize: 5, wait: 2000 }
 * );
 *
 * // Add items
 * batcher.addItem('task1');
 *
 * // Access the selected state
 * const { items, isPending } = batcher.state();
 * ```
 */
export function createBatcher<TValue, TSelected = {}>(
  fn: (items: Array<TValue>) => void,
  options: BatcherOptions<TValue> = {},
  selector: (state: BatcherState<TValue>) => TSelected = () =>
    ({}) as TSelected,
): AngularBatcher<TValue, TSelected> {
  const mergedOptions = {
    ...useDefaultPacerOptions().batcher,
    ...options,
  } as BatcherOptions<TValue>

  const batcher = new Batcher<TValue>(fn, mergedOptions)
  const stateSignal = signal<Readonly<TSelected>>(
    selector(batcher.store.state) as Readonly<TSelected>,
  )

  // Subscribe to store changes and update signal
  const unsubscribe = batcher.store.subscribe((state) => {
    const selected = selector(state)
    stateSignal.set(selected as Readonly<TSelected>)
  })

  const destroyRef = inject(DestroyRef, { optional: true })
  if (destroyRef) {
    destroyRef.onDestroy(() => {
      unsubscribe()
      batcher.flush()
    })
  }

  return {
    ...batcher,
    state: stateSignal.asReadonly(),
  } as AngularBatcher<TValue, TSelected>
}

