import { createAsyncRateLimiter } from './createAsyncRateLimiter'
import type {
  LitAsyncRateLimiter,
  LitAsyncRateLimiterOptions,
} from './createAsyncRateLimiter'
import type { LitPacerOptions } from '../types'
import type { ReactiveControllerHost } from 'lit'
import type { AsyncRateLimiterState } from '@tanstack/pacer/async-rate-limiter'
import type { AnyAsyncFunction } from '@tanstack/pacer/types'

/** Owns a AsyncRateLimiter for a Lit host. Access core methods and selected state through `pacer`. */
export class AsyncRateLimiterController<
  TFn extends AnyAsyncFunction,
  TSelected = {},
> {
  readonly pacer: LitAsyncRateLimiter<TFn, TSelected>
  constructor(
    host: ReactiveControllerHost,
    fn: TFn,
    options: LitPacerOptions<LitAsyncRateLimiterOptions<TFn, TSelected>>,
    selector: (state: AsyncRateLimiterState<TFn>) => TSelected = () =>
      ({}) as TSelected,
  ) {
    this.pacer = createAsyncRateLimiter(host, fn, options, selector)
  }
  /** Selected reactive state. Reading this property participates in host rendering. */
  get state(): Readonly<TSelected> {
    return this.pacer.state
  }
}
