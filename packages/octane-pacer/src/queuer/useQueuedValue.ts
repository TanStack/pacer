import { useLayoutEffect, useState } from 'octane'
import { splitSlot, subSlot } from '../utils/slots'
import { useQueuer } from './useQueuer'
import type { OctaneQueuer, OctaneQueuerOptions } from './useQueuer'
import type { OctanePacerOptions } from '../types'
import type { QueuerState } from '@tanstack/pacer/queuer'

/**
 * Derives a queued value from its current source.
 *
 * Retains accepted items until processing. Ordering, capacity, wait, and started options follow the underlying queue.
 *
 * ## Return value
 *
 * Returns [value, utility]. Read the value during component rendering. Pass the current render value. The initial value is available immediately. Source changes schedule updates on the existing utility. The exposed value is the last processed item, not the pending item array.
 *
 * ## State and ownership
 *
 * The value updates independently of the utility selector. The default utility selection is {}. Pass a selector to subscribe to fields such as executionCount, isPending, or status where the underlying utility exposes them.
 *
 * Call during component rendering. The hook retains its utility across renders and runs cleanup when the component unmounts.
 * Options accept an object with top-level getters or an options factory. Function-valued core options remain callbacks. Local options override provider defaults without replacing the utility or its pending work.
 * onUnmount replaces default cleanup and receives the utility instance. A custom callback must perform every needed cancel, stop, or abort action.
 *
 * @example
 * ```ts
 * import { useQueuedValue } from '@tanstack/octane-pacer'
 *
 * // During component rendering:
 * // query is the current value from props or state.
 * const [value, utility] = useQueuedValue(query, { wait: 500 })
 * // Bind value and use utility for controls. Read value for the committed value.
 * ```
 *
 * @see useQueuer
 */
export function useQueuedValue<TValue, TSelected = {}>(
  source: TValue,
  options?: OctanePacerOptions<OctaneQueuerOptions<TValue, TSelected>>,
  selector?: (state: QueuerState<TValue>) => TSelected,
): [TValue, OctaneQueuer<TValue, TSelected>]
export function useQueuedValue<TValue, TSelected = {}>(
  source: TValue,
  ...rest: [
    options?: OctanePacerOptions<OctaneQueuerOptions<TValue, TSelected>>,
    selector?: (state: QueuerState<TValue>) => TSelected,
    slot?: symbol,
  ]
): [TValue, OctaneQueuer<TValue, TSelected>] {
  const [args, slot] = splitSlot(rest)
  const [value, setValue] = useState<TValue>(source, subSlot(slot, 'value'))
  const hook = useQueuer<TValue, TSelected> as (
    ...args: [...Parameters<typeof useQueuer<TValue, TSelected>>, symbol]
  ) => OctaneQueuer<TValue, TSelected>
  const utility = hook(
    (next) => setValue(() => next),
    args[0] as OctanePacerOptions<OctaneQueuerOptions<TValue, TSelected>>,
    args[1] as ((state: QueuerState<TValue>) => TSelected) | undefined,
    subSlot(slot, 'utility'),
  )
  useLayoutEffect(
    () => {
      utility.addItem(source)
    },
    [source],
    subSlot(slot, 'source'),
  )
  return [value, utility]
}
