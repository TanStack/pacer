import { createAsyncThrottler } from './createAsyncThrottler'
import type {
  LitAsyncThrottler,
  LitAsyncThrottlerOptions,
} from './createAsyncThrottler'
import type { LitPacerOptions } from '../types'
import type { ReactiveControllerHost } from 'lit'
import type { AsyncThrottlerState } from '@tanstack/pacer/async-throttler'
import type { AnyAsyncFunction } from '@tanstack/pacer/types'

/** Owns a AsyncThrottler for a Lit host. Access core methods and selected state through `pacer`. */
export class AsyncThrottlerController<
  TFn extends AnyAsyncFunction,
  TSelected = {},
> {
  readonly pacer: LitAsyncThrottler<TFn, TSelected>
  constructor(
    host: ReactiveControllerHost,
    fn: TFn,
    options: LitPacerOptions<LitAsyncThrottlerOptions<TFn, TSelected>>,
    selector: (state: AsyncThrottlerState<TFn>) => TSelected = () =>
      ({}) as TSelected,
  ) {
    this.pacer = createAsyncThrottler(host, fn, options, selector)
  }
  /** Selected reactive state. Reading this property participates in host rendering. */
  get state(): Readonly<TSelected> {
    return this.pacer.state
  }
}
