import { createAsyncDebouncer } from './createAsyncDebouncer'
import type {
  LitAsyncDebouncer,
  LitAsyncDebouncerOptions,
} from './createAsyncDebouncer'
import type { LitPacerOptions } from '../types'
import type { ReactiveControllerHost } from 'lit'
import type { AsyncDebouncerState } from '@tanstack/pacer/async-debouncer'
import type { AnyAsyncFunction } from '@tanstack/pacer/types'

/** Owns a AsyncDebouncer for a Lit host. Access core methods and selected state through `pacer`. */
export class AsyncDebouncerController<
  TFn extends AnyAsyncFunction,
  TSelected = {},
> {
  readonly pacer: LitAsyncDebouncer<TFn, TSelected>
  constructor(
    host: ReactiveControllerHost,
    fn: TFn,
    options: LitPacerOptions<LitAsyncDebouncerOptions<TFn, TSelected>>,
    selector: (state: AsyncDebouncerState<TFn>) => TSelected = () =>
      ({}) as TSelected,
  ) {
    this.pacer = createAsyncDebouncer(host, fn, options, selector)
  }
  /** Selected reactive state. Reading this property participates in host rendering. */
  get state(): Readonly<TSelected> {
    return this.pacer.state
  }
}
