import { Batcher } from '@tanstack/pacer/batcher'
import { bindPacer } from '../utils/bindPacer.svelte'
import { useDefaultPacerOptions } from '../provider/PacerProvider'
import type { SveltePacerSubscribe } from '../utils/createSubscribe'
import type { BatcherOptions, BatcherState } from '@tanstack/pacer/batcher'
import type { SveltePacerOptions } from '../types'

/** Options for createBatcher, including owner cleanup. */
export interface SvelteBatcherOptions<
  TValue,
  TSelected = {},
> extends BatcherOptions<TValue> {
  /** Replaces default cleanup. Use this to flush, cancel, or stop pending work. */
  onUnmount?: (instance: SvelteBatcher<TValue, TSelected>) => void
}

/** A Batcher with framework-reactive selected state. All core methods remain available. */
export interface SvelteBatcher<TValue, TSelected = {}> extends Omit<
  Batcher<TValue>,
  'options' | 'setOptions'
> {
  options: Batcher<TValue>['options'] & SvelteBatcherOptions<TValue, TSelected>
  setOptions: (
    options: Partial<SvelteBatcherOptions<TValue, TSelected>>,
  ) => void
  /** Subscribes a child snippet to state without updating the utility owner. */
  Subscribe: SveltePacerSubscribe<BatcherState<TValue>>
  /** Selected state. Pass a selector to opt in; the default selection is an empty object. */
  readonly state: Readonly<TSelected>
}

/**
 * Creates and retains the Batcher for its Svelte owner.
 *
 * Collects items and processes them together when maxSize, wait, or getShouldExecute triggers a batch. Use addItem to accumulate work and flush to process a partial batch.
 *
 * ## State and subscriptions
 *
 * Pass a selector to track only the state consumed by the owner. The default selection is {},
 * so utility state changes do not update the owner unless it opts in. Selection uses shallow
 * comparison. The raw store remains available for additional subscriptions.
 * Read selected state through utility.state. Use utility.Subscribe with a children snippet
 * to select state in a child without updating the owner.
 *
 * Available state fields:
 *
 * - `executionCount`: Number of batch executions that have been completed
 * - `isEmpty`: Whether the batcher has no items to process (items array is empty)
 * - `isPending`: Whether the batcher is waiting for the timeout to trigger batch processing
 * - `items`: Array of items currently queued for batch processing
 * - `size`: Number of items currently in the batch queue
 * - `status`: Current processing status - 'idle' when not processing, 'pending' when waiting for timeout
 * - `totalItemsProcessed`: Total number of items that have been processed across all batches
 *
 * ## Options and ownership
 *
 * Pass an options object with property getters or a factory. Top-level properties are read
 * reactively; function-valued core options remain callbacks. Local options override provider
 * defaults. Updates retain the utility, its store, counters, and pending work.
 * Destroying the component calls cancel().
 * onUnmount replaces default cleanup and receives the same adapter instance. A custom callback
 * must perform all required cleanup. Use flush() where supported to finish pending work.
 *
 * @example
 * ```ts
 * import { createBatcher } from '@tanstack/svelte-pacer'
 *
 * const utility = createBatcher(
 *   (items: Array<string>) => { console.log(items) },
 *   { maxSize: 5, wait: 1000 },
 *   (state) => ({ size: state.size }),
 * )
 * utility.addItem('item')
 * // Selected state: utility.state.size
 * ```
 * @param fn - Function executed by the utility.
 * @param options - Core options or a reactive factory, plus an optional onUnmount callback.
 * @param selector - Selects state that updates the owner. Omit to leave selected state empty.
 * @returns The retained utility instance with selected state and child subscriptions.
 */
export function createBatcher<TValue, TSelected = {}>(
  fn: (items: Array<TValue>) => void,
  options: SveltePacerOptions<SvelteBatcherOptions<TValue, TSelected>> = {},
  selector: (state: BatcherState<TValue>) => TSelected = () =>
    ({}) as TSelected,
): SvelteBatcher<TValue, TSelected> {
  const defaults = useDefaultPacerOptions()
  const resolve = (): SvelteBatcherOptions<TValue, TSelected> => ({
    ...defaults().batcher,
    ...(typeof options === 'function' ? options() : options),
  })
  const instance = new Batcher<TValue>(
    fn,
    resolve(),
  ) as unknown as SvelteBatcher<TValue, TSelected>
  return bindPacer(instance, resolve, selector, () => {
    if (instance.options.onUnmount) {
      instance.options.onUnmount(instance)
      return
    }
    instance.cancel()
  })
}
