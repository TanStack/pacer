import { createRateLimiter } from './createRateLimiter'
import type { LitRateLimiter, LitRateLimiterOptions } from './createRateLimiter'
import type { LitPacerOptions } from '../types'
import type { ReactiveControllerHost } from 'lit'
import type { RateLimiterState } from '@tanstack/pacer/rate-limiter'
import type { AnyFunction } from '@tanstack/pacer/types'

/** Owns a RateLimiter for a Lit host. Access core methods and selected state through `pacer`. */
export class RateLimiterController<TFn extends AnyFunction, TSelected = {}> {
  readonly pacer: LitRateLimiter<TFn, TSelected>
  constructor(
    host: ReactiveControllerHost,
    fn: TFn,
    options: LitPacerOptions<LitRateLimiterOptions<TFn, TSelected>>,
    selector: (state: RateLimiterState) => TSelected = () => ({}) as TSelected,
  ) {
    this.pacer = createRateLimiter(host, fn, options, selector)
  }
  /** Selected reactive state. Reading this property participates in host rendering. */
  get state(): Readonly<TSelected> {
    return this.pacer.state
  }
}
