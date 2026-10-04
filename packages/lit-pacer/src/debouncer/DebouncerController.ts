import { createDebouncer } from './createDebouncer'
import type { LitDebouncer, LitDebouncerOptions } from './createDebouncer'
import type { LitPacerOptions } from '../types'
import type { ReactiveControllerHost } from 'lit'
import type { DebouncerState } from '@tanstack/pacer/debouncer'
import type { AnyFunction } from '@tanstack/pacer/types'

/** Owns a Debouncer for a Lit host. Access core methods and selected state through `pacer`. */
export class DebouncerController<TFn extends AnyFunction, TSelected = {}> {
  readonly pacer: LitDebouncer<TFn, TSelected>
  constructor(
    host: ReactiveControllerHost,
    fn: TFn,
    options: LitPacerOptions<LitDebouncerOptions<TFn, TSelected>>,
    selector: (state: DebouncerState<TFn>) => TSelected = () =>
      ({}) as TSelected,
  ) {
    this.pacer = createDebouncer(host, fn, options, selector)
  }
  /** Selected reactive state. Reading this property participates in host rendering. */
  get state(): Readonly<TSelected> {
    return this.pacer.state
  }
}
