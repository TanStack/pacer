import { createCell } from '../utils/cell.svelte'
import { createThrottler } from './createThrottler'
import type { SvelteThrottler, SvelteThrottlerOptions } from './createThrottler'
import type { ThrottlerState } from '@tanstack/pacer/throttler'
import type { SveltePacerOptions } from '../types'
import type { CellValue, SetValue } from '../utils/cell.svelte'
/**
 * Creates a throttled state value and its setter. Functional updates are evaluated
 * when the utility executes, using the last committed value. The third tuple entry
 * exposes control methods and opt-in selected state.
 */
export function createThrottledSignal<TValue, TSelected = {}>(
  initialValue: TValue,
  options: SveltePacerOptions<
    SvelteThrottlerOptions<SetValue<TValue>, TSelected>
  >,
  selector?: (state: ThrottlerState<SetValue<TValue>>) => TSelected,
): [
  CellValue<TValue>,
  SetValue<TValue>,
  SvelteThrottler<SetValue<TValue>, TSelected>,
] {
  const cell = createCell(initialValue)
  const utility = createThrottler(cell.set, options, selector)
  return [
    cell.value,
    (value) => {
      utility.maybeExecute(value)
    },
    utility,
  ]
}
