import { observe, readSource } from '../utils/cell'
import { createThrottledState } from './createThrottledState'
import type { ReactiveControllerHost } from 'lit'
import type { LitThrottler, LitThrottlerOptions } from './createThrottler'
import type { ThrottlerState } from '@tanstack/pacer/throttler'
import type { LitPacerOptions } from '../types'
import type { CellValue, SetValue, ValueSource } from '../utils/cell'
/** Derives a throttled value from a reactive source. Returns the value and its utility. */
export function createThrottledValue<TValue, TSelected = {}>(
  host: ReactiveControllerHost,
  source: ValueSource<TValue>,
  options: LitPacerOptions<LitThrottlerOptions<SetValue<TValue>, TSelected>>,
  selector?: (state: ThrottlerState<SetValue<TValue>>) => TSelected,
): [CellValue<TValue>, LitThrottler<SetValue<TValue>, TSelected>] {
  const [value, setValue, utility] = createThrottledState(
    host,
    readSource(source),
    options,
    selector,
  )
  observe(host, source, setValue)
  return [value, utility]
}
