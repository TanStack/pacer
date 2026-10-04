import { useLayoutEffect, useState } from 'octane'
import { splitSlot, subSlot } from '../utils/slots'
import { useQueuer } from './useQueuer'
import type { OctaneQueuer, OctaneQueuerOptions } from './useQueuer'
import type { OctanePacerOptions } from '../types'
import type { QueuerState } from '@tanstack/pacer/queuer'

/** Processes render values in queue order and returns the last processed value and queue. */
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
