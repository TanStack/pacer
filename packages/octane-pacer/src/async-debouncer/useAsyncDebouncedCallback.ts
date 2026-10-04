import { splitSlot, subSlot } from '../utils/slots'
import { useAsyncDebouncer } from './useAsyncDebouncer'
import type {
  OctaneAsyncDebouncer,
  OctaneAsyncDebouncerOptions,
} from './useAsyncDebouncer'
import type { OctanePacerOptions } from '../types'
import type { AnyAsyncFunction } from '@tanstack/pacer/types'
/**
 * Returns a stable debounced callback with the same options and cleanup as useAsyncDebouncer.
 * Use the constructor instead when you also need selected state or control methods.
 */
export function useAsyncDebouncedCallback<TFn extends AnyAsyncFunction>(
  fn: TFn,
  options: OctanePacerOptions<OctaneAsyncDebouncerOptions<TFn>>,
): OctaneAsyncDebouncer<TFn>['maybeExecute']
export function useAsyncDebouncedCallback<TFn extends AnyAsyncFunction>(
  fn: TFn,
  ...rest: [
    options: OctanePacerOptions<OctaneAsyncDebouncerOptions<TFn>>,
    slot?: symbol,
  ]
): OctaneAsyncDebouncer<TFn>['maybeExecute'] {
  const [args, slot] = splitSlot(rest)
  const hook = useAsyncDebouncer<TFn> as (
    ...args: [...Parameters<typeof useAsyncDebouncer<TFn>>, symbol]
  ) => OctaneAsyncDebouncer<TFn>
  return hook(
    fn,
    args[0] as OctanePacerOptions<OctaneAsyncDebouncerOptions<TFn>>,
    undefined,
    subSlot(slot, 'utility'),
  ).maybeExecute
}
