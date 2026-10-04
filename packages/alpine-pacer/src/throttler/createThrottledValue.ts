import { observe, readSource } from '../utils/cell'
import { createThrottledState } from './createThrottledState'
import type { PacerScope } from '../provider/PacerProvider'
import type { AlpineThrottler, AlpineThrottlerOptions } from './createThrottler'
import type { ThrottlerState } from '@tanstack/pacer/throttler'
import type { AlpinePacerOptions } from '../types'
import type { CellValue, SetValue, ValueSource } from '../utils/cell'
/** Derives a throttled value from a reactive source. Returns the value and its utility. */
export function createThrottledValue<TValue, TSelected = {}>(
  scope: PacerScope,
  source: ValueSource<TValue>,
  options: AlpinePacerOptions<
    AlpineThrottlerOptions<SetValue<TValue>, TSelected>
  >,
  selector?: (state: ThrottlerState<SetValue<TValue>>) => TSelected,
): [CellValue<TValue>, AlpineThrottler<SetValue<TValue>, TSelected>] {
  const [value, setValue, utility] = createThrottledState(
    scope,
    readSource(source),
    options,
    selector,
  )
  observe(scope, source, setValue)
  return [value, utility]
}
