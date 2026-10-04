import { useState } from 'octane'
import { splitSlot, subSlot } from '../utils/slots'
import { useThrottler } from './useThrottler'
import type { OctaneThrottler, OctaneThrottlerOptions } from './useThrottler'
import type { ThrottlerState } from '@tanstack/pacer/throttler'
import type { OctanePacerOptions } from '../types'
import type { SetValue } from '../utils/cell'
/** Creates throttled state with a setter and the underlying utility. */
export function useThrottledState<TValue, TSelected = {}>(
  initialValue: TValue,
  options: OctanePacerOptions<
    OctaneThrottlerOptions<SetValue<TValue>, TSelected>
  >,
  selector?: (state: ThrottlerState<SetValue<TValue>>) => TSelected,
): [TValue, SetValue<TValue>, OctaneThrottler<SetValue<TValue>, TSelected>]
export function useThrottledState<TValue, TSelected = {}>(
  initialValue: TValue,
  ...rest: [
    options: OctanePacerOptions<
      OctaneThrottlerOptions<SetValue<TValue>, TSelected>
    >,
    selector?: (state: ThrottlerState<SetValue<TValue>>) => TSelected,
    slot?: symbol,
  ]
): [TValue, SetValue<TValue>, OctaneThrottler<SetValue<TValue>, TSelected>] {
  const [args, slot] = splitSlot(rest)
  const [value, setValue] = useState<TValue>(
    initialValue,
    subSlot(slot, 'value'),
  )
  const hook = useThrottler<SetValue<TValue>, TSelected> as (
    ...args: [
      ...Parameters<typeof useThrottler<SetValue<TValue>, TSelected>>,
      symbol,
    ]
  ) => OctaneThrottler<SetValue<TValue>, TSelected>
  const utility = hook(
    setValue,
    args[0] as OctanePacerOptions<
      OctaneThrottlerOptions<SetValue<TValue>, TSelected>
    >,
    args[1] as
      ((state: ThrottlerState<SetValue<TValue>>) => TSelected) | undefined,
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
