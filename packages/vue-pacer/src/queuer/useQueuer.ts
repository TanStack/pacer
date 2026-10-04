import { Queuer } from '@tanstack/pacer/queuer'
import { bindPacer } from '../utils/bindPacer'
import { useDefaultPacerOptions } from '../provider/PacerProvider'
import type { VuePacerSubscribe } from '../utils/Subscribe'
import type { QueuerOptions, QueuerState } from '@tanstack/pacer/queuer'
import type { ShallowRef } from 'vue'
import type { VuePacerOptions } from '../types'

/** Options for useQueuer, including owner cleanup. */
export interface VueQueuerOptions<
  TValue,
  TSelected = {},
> extends QueuerOptions<TValue> {
  /** Replaces default cleanup. Use this to flush, cancel, or stop pending work. */
  onUnmount?: (instance: VueQueuer<TValue, TSelected>) => void
}

/** A Queuer with framework-reactive selected state. All core methods remain available. */
export interface VueQueuer<TValue, TSelected = {}> extends Omit<
  Queuer<TValue>,
  'options' | 'setOptions'
> {
  options: Queuer<TValue>['options'] & VueQueuerOptions<TValue, TSelected>
  setOptions: (options: Partial<VueQueuerOptions<TValue, TSelected>>) => void
  /** Subscribes a scoped slot to state without re-rendering the utility owner. */
  Subscribe: VuePacerSubscribe<QueuerState<TValue>>
  /** Selected state. Pass a selector to opt in; the default selection is an empty object. */
  readonly state: Readonly<ShallowRef<TSelected>>
}

/**
 * Creates and retains the Queuer for its Vue owner.
 *
 * Retains items until they are processed. Use addItem to enqueue work and start, stop, execute, clear, or flush to control processing. Selected state exposes pending items, capacity, and completed work.
 *
 * ## State and subscriptions
 *
 * Pass a selector to track only the state consumed by the owner. The default selection is {},
 * so utility state changes do not update the owner unless it opts in. Selection uses shallow
 * comparison. The raw store remains available for additional subscriptions.
 * Read selected state through utility.state.value in JavaScript. Vue templates unwrap refs.
 * Use utility.Subscribe with a scoped slot to select state in a child without updating the owner.
 *
 * Available state fields:
 *
 * - `addItemCount`: Number of times addItem has been called (for reduction calculations)
 * - `executionCount`: Number of items that have been processed by the queuer
 * - `expirationCount`: Number of items that have been removed from the queue due to expiration
 * - `isEmpty`: Whether the queuer has no items to process (items array is empty)
 * - `isFull`: Whether the queuer has reached its maximum capacity
 * - `isIdle`: Whether the queuer is not currently processing any items
 * - `isRunning`: Whether the queuer is active and will process items automatically
 * - `items`: Array of items currently waiting to be processed
 * - `itemTimestamps`: Timestamps when items were added to the queue for expiration tracking
 * - `pendingTick`: Whether the queuer has a pending timeout for processing the next item
 * - `rejectionCount`: Number of items that have been rejected from being added to the queue
 * - `size`: Number of items currently in the queue
 * - `status`: Current processing status - 'idle' when not processing, 'running' when active, 'stopped' when paused
 *
 * ## Options and ownership
 *
 * Pass an options object with property getters or a factory. Top-level properties are read
 * reactively; function-valued core options remain callbacks. Local options override provider
 * defaults. Updates retain the utility, its store, counters, and pending work.
 * Disposing the component or effect scope calls stop().
 * onUnmount replaces default cleanup and receives the same adapter instance. A custom callback
 * must perform all required cleanup. Use flush() where supported to finish pending work.
 *
 * @example
 * ```ts
 * import { useQueuer } from '@tanstack/vue-pacer'
 *
 * const utility = useQueuer(
 *   (value: string) => { console.log(value) },
 *   { wait: 100 },
 *   (state) => ({ size: state.size }),
 * )
 * utility.addItem('item')
 * // Selected state: utility.state.value.size
 * ```
 * @param fn - Function executed by the utility.
 * @param options - Core options or a reactive factory, plus an optional onUnmount callback.
 * @param selector - Selects state that updates the owner. Omit to leave selected state empty.
 * @returns The retained utility instance with selected state and child subscriptions.
 */
export function useQueuer<TValue, TSelected = {}>(
  fn: (item: TValue) => void,
  options: VuePacerOptions<VueQueuerOptions<TValue, TSelected>> = {},
  selector: (state: QueuerState<TValue>) => TSelected = () => ({}) as TSelected,
): VueQueuer<TValue, TSelected> {
  const defaults = useDefaultPacerOptions()
  const resolve = (): VueQueuerOptions<TValue, TSelected> => ({
    ...defaults().queuer,
    ...(typeof options === 'function' ? options() : options),
  })
  const instance = new Queuer<TValue>(fn, resolve()) as unknown as VueQueuer<
    TValue,
    TSelected
  >
  return bindPacer(instance, resolve, selector, () => {
    if (instance.options.onUnmount) {
      instance.options.onUnmount(instance)
      return
    }
    instance.stop()
  })
}
