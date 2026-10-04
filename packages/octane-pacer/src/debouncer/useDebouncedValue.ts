import { useLayoutEffect } from 'octane'
import { splitSlot, subSlot } from '../utils/slots'
import { useDebouncedState } from './useDebouncedState'
import type { OctaneDebouncer, OctaneDebouncerOptions } from './useDebouncer'
import type { DebouncerState } from '@tanstack/pacer/debouncer'
import type { OctanePacerOptions } from '../types'
import type { SetValue } from '../utils/cell'
/** Derives a debounced value from the current render value. */
export function useDebouncedValue<TValue, TSelected = {}>(
  source: TValue,
  options: OctanePacerOptions<
    OctaneDebouncerOptions<SetValue<TValue>, TSelected>
  >,
  selector?: (state: DebouncerState<SetValue<TValue>>) => TSelected,
): [TValue, OctaneDebouncer<SetValue<TValue>, TSelected>]
export function useDebouncedValue<TValue, TSelected = {}>(
  source: TValue,
  ...rest: [
    options: OctanePacerOptions<
      OctaneDebouncerOptions<SetValue<TValue>, TSelected>
    >,
    selector?: (state: DebouncerState<SetValue<TValue>>) => TSelected,
    slot?: symbol,
  ]
): [TValue, OctaneDebouncer<SetValue<TValue>, TSelected>] {
  const [args, slot] = splitSlot(rest)
  const hook = useDebouncedState<TValue, TSelected> as (
    ...args: [
      ...Parameters<typeof useDebouncedState<TValue, TSelected>>,
      symbol,
    ]
  ) => [TValue, SetValue<TValue>, OctaneDebouncer<SetValue<TValue>, TSelected>]
  const [value, , utility] = hook(
    source,
    args[0] as OctanePacerOptions<
      OctaneDebouncerOptions<SetValue<TValue>, TSelected>
    >,
    args[1] as
      ((state: DebouncerState<SetValue<TValue>>) => TSelected) | undefined,
    subSlot(slot, 'state'),
  )
  useLayoutEffect(
    () => {
      utility.maybeExecute(() => source)
    },
    [source],
    subSlot(slot, 'source'),
  )
  return [value, utility]
}
