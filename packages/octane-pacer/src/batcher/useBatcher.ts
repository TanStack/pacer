import { Batcher } from '@tanstack/pacer/batcher'
import { useLayoutEffect, useRef } from 'octane'
import { shallow } from '@tanstack/octane-store'
import { createSubscribe } from '../utils/Subscribe'
import { select, splitSlot, subSlot } from '../utils/slots'
import { useDefaultPacerOptions } from '../provider/PacerProvider'
import type { OctanePacerSubscribe } from '../utils/Subscribe'
import type { BatcherOptions, BatcherState } from '@tanstack/pacer/batcher'
import type { OctanePacerOptions } from '../types'

/** Options for useBatcher, including owner cleanup. */
export interface OctaneBatcherOptions<
  TValue,
  TSelected = {},
> extends BatcherOptions<TValue> {
  /** Replaces default cleanup. Use this to flush, cancel, or stop pending work. */
  onUnmount?: (instance: OctaneBatcher<TValue, TSelected>) => void
}

/** A Batcher with framework-reactive selected state. All core methods remain available. */
export interface OctaneBatcher<TValue, TSelected = {}> extends Omit<
  Batcher<TValue>,
  'options' | 'setOptions'
> {
  options: Batcher<TValue>['options'] & OctaneBatcherOptions<TValue, TSelected>
  setOptions: (
    options: Partial<OctaneBatcherOptions<TValue, TSelected>>,
  ) => void
  /** Selects state in a child without subscribing the utility owner. */
  Subscribe: OctanePacerSubscribe<BatcherState<TValue>>
  /** Selected state. Pass a selector to opt in; the default selection is an empty object. */
  readonly state: Readonly<TSelected>
}

/**
 * Creates and retains the Batcher for its Octane owner.
 *
 * Collects items and processes them together when maxSize, wait, or getShouldExecute triggers a batch. Use addItem to accumulate work and flush to process a partial batch.
 *
 * ## State and subscriptions
 *
 * Pass a selector to track only the state consumed by the owner. The default selection is {},
 * so utility state changes do not update the owner unless it opts in. Selection uses shallow
 * comparison. The raw store remains available for additional subscriptions.
 * Read selected state through utility.state. Use utility.Subscribe with a render callback
 * to select state in a child without subscribing the owner.
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
 * Unmounting the component calls cancel().
 * onUnmount replaces default cleanup and receives the same adapter instance. A custom callback
 * must perform all required cleanup. Use flush() where supported to finish pending work.
 *
 * @example
 * ```ts
 * import { useBatcher } from '@tanstack/octane-pacer'
 *
 * const utility = useBatcher(
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
export function useBatcher<TValue, TSelected = {}>(
  fn: (items: Array<TValue>) => void,
  options?: OctanePacerOptions<OctaneBatcherOptions<TValue, TSelected>>,
  selector?: (state: BatcherState<TValue>) => TSelected,
): OctaneBatcher<TValue, TSelected>
export function useBatcher<TValue, TSelected = {}>(
  fn: (items: Array<TValue>) => void,
  ...rest: [
    options?: OctanePacerOptions<OctaneBatcherOptions<TValue, TSelected>>,
    selector?: (state: BatcherState<TValue>) => TSelected,
    slot?: symbol,
  ]
): OctaneBatcher<TValue, TSelected> {
  const [args, slot] = splitSlot(rest)
  const options = (args[0] ?? {}) as OctanePacerOptions<
    OctaneBatcherOptions<TValue, TSelected>
  >
  const selector = (args[1] ?? (() => ({}))) as (
    state: BatcherState<TValue>,
  ) => TSelected
  const defaults = useDefaultPacerOptions()
  const merged: OctaneBatcherOptions<TValue, TSelected> = {
    ...defaults.batcher,
    ...(typeof options === 'function' ? options() : options),
  }
  const ref = useRef<OctaneBatcher<TValue, TSelected> | null>(
    null,
    subSlot(slot, 'instance'),
  )
  ref.current ??= new Batcher<TValue>(fn, merged) as unknown as OctaneBatcher<
    TValue,
    TSelected
  >
  const instance = ref.current
  if (!Object.hasOwn(instance, 'Subscribe')) {
    Object.defineProperty(instance, 'Subscribe', {
      value: createSubscribe(instance.store),
      enumerable: true,
    })
  }
  useLayoutEffect(
    () => {
      instance.fn = fn
      instance.setOptions(merged)
    },
    null,
    subSlot(slot, 'options'),
  )
  const state = select(
    instance.store,
    selector,
    { compare: shallow },
    subSlot(slot, 'state'),
  )
  Object.defineProperty(instance, 'state', {
    value: state,
    configurable: true,
    enumerable: true,
  })
  useLayoutEffect(
    () => () => {
      if (instance.options.onUnmount) instance.options.onUnmount(instance)
      else {
        instance.cancel()
      }
    },
    [],
    subSlot(slot, 'cleanup'),
  )
  return instance
}
