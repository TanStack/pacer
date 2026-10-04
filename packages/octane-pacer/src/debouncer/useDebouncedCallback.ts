import { splitSlot, subSlot } from '../utils/slots'
import { useDebouncer } from './useDebouncer'
import type { OctaneDebouncer, OctaneDebouncerOptions } from './useDebouncer'
import type { OctanePacerOptions } from '../types'
import type { AnyFunction } from '@tanstack/pacer/types'
/**
 * Returns a stable debounced callback with the same options and cleanup as useDebouncer.
 * Use the constructor instead when you also need selected state or control methods.
 */
export function useDebouncedCallback<TFn extends AnyFunction>(
  fn: TFn,
  options: OctanePacerOptions<OctaneDebouncerOptions<TFn>>,
): OctaneDebouncer<TFn>['maybeExecute']
export function useDebouncedCallback<TFn extends AnyFunction>(
  fn: TFn,
  ...rest: [
    options: OctanePacerOptions<OctaneDebouncerOptions<TFn>>,
    slot?: symbol,
  ]
): OctaneDebouncer<TFn>['maybeExecute'] {
  const [args, slot] = splitSlot(rest)
  const hook = useDebouncer<TFn> as (
    ...args: [...Parameters<typeof useDebouncer<TFn>>, symbol]
  ) => OctaneDebouncer<TFn>
  return hook(
    fn,
    args[0] as OctanePacerOptions<OctaneDebouncerOptions<TFn>>,
    undefined,
    subSlot(slot, 'utility'),
  ).maybeExecute
}
