import { useState } from 'octane'
import { splitSlot, subSlot } from '../utils/slots'
import { useDebouncer } from './useDebouncer'
import type { OctaneDebouncer, OctaneDebouncerOptions } from './useDebouncer'
import type { DebouncerState } from '@tanstack/pacer/debouncer'
import type { OctanePacerOptions } from '../types'
import type { SetValue } from '../utils/cell'
/** Creates debounced state with a setter and the underlying utility. */
export function useDebouncedState<TValue, TSelected = {}>(
  initialValue: TValue,
  options: OctanePacerOptions<
    OctaneDebouncerOptions<SetValue<TValue>, TSelected>
  >,
  selector?: (state: DebouncerState<SetValue<TValue>>) => TSelected,
): [TValue, SetValue<TValue>, OctaneDebouncer<SetValue<TValue>, TSelected>]
export function useDebouncedState<TValue, TSelected = {}>(
  initialValue: TValue,
  ...rest: [
    options: OctanePacerOptions<
      OctaneDebouncerOptions<SetValue<TValue>, TSelected>
    >,
    selector?: (state: DebouncerState<SetValue<TValue>>) => TSelected,
    slot?: symbol,
  ]
): [TValue, SetValue<TValue>, OctaneDebouncer<SetValue<TValue>, TSelected>] {
  const [args, slot] = splitSlot(rest)
  const [value, setValue] = useState<TValue>(
    initialValue,
    subSlot(slot, 'value'),
  )
  const hook = useDebouncer<SetValue<TValue>, TSelected> as (
    ...args: [
      ...Parameters<typeof useDebouncer<SetValue<TValue>, TSelected>>,
      symbol,
    ]
  ) => OctaneDebouncer<SetValue<TValue>, TSelected>
  const utility = hook(
    setValue,
    args[0] as OctanePacerOptions<
      OctaneDebouncerOptions<SetValue<TValue>, TSelected>
    >,
    args[1] as
      ((state: DebouncerState<SetValue<TValue>>) => TSelected) | undefined,
    subSlot(slot, 'utility'),
  )
  return [
    value,
    (next) => {
      utility.maybeExecute(next)
    },
    utility,
  ]
}
