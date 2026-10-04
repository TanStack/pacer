import { useLayoutEffect } from 'octane'
import { splitSlot, subSlot } from '../utils/slots'
import { useThrottledState } from './useThrottledState'
import type { OctaneThrottler, OctaneThrottlerOptions } from './useThrottler'
import type { ThrottlerState } from '@tanstack/pacer/throttler'
import type { OctanePacerOptions } from '../types'
import type { SetValue } from '../utils/cell'
/** Derives a throttled value from the current render value. */
export function useThrottledValue<TValue, TSelected = {}>(
  source: TValue,
  options: OctanePacerOptions<
    OctaneThrottlerOptions<SetValue<TValue>, TSelected>
  >,
  selector?: (state: ThrottlerState<SetValue<TValue>>) => TSelected,
): [TValue, OctaneThrottler<SetValue<TValue>, TSelected>]
export function useThrottledValue<TValue, TSelected = {}>(
  source: TValue,
  ...rest: [
    options: OctanePacerOptions<
      OctaneThrottlerOptions<SetValue<TValue>, TSelected>
    >,
    selector?: (state: ThrottlerState<SetValue<TValue>>) => TSelected,
    slot?: symbol,
  ]
): [TValue, OctaneThrottler<SetValue<TValue>, TSelected>] {
  const [args, slot] = splitSlot(rest)
  const hook = useThrottledState<TValue, TSelected> as (
    ...args: [
      ...Parameters<typeof useThrottledState<TValue, TSelected>>,
      symbol,
    ]
  ) => [TValue, SetValue<TValue>, OctaneThrottler<SetValue<TValue>, TSelected>]
  const [value, , utility] = hook(
    source,
    args[0] as OctanePacerOptions<
      OctaneThrottlerOptions<SetValue<TValue>, TSelected>
    >,
    args[1] as
      ((state: ThrottlerState<SetValue<TValue>>) => TSelected) | undefined,
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
