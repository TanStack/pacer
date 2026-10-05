import { createThrottler } from './createThrottler'
import type { LitThrottler, LitThrottlerOptions } from './createThrottler'
import type { LitPacerOptions } from '../types'
import type { ReactiveControllerHost } from 'lit'
import type { ThrottlerState } from '@tanstack/pacer/throttler'
import type { AnyFunction } from '@tanstack/pacer/types'

/** Owns a Throttler for a Lit host. Access core methods and selected state through `pacer`. */
export class ThrottlerController<TFn extends AnyFunction, TSelected = {}> {
  readonly pacer: LitThrottler<TFn, TSelected>
  constructor(
    host: ReactiveControllerHost,
    fn: TFn,
    options: LitPacerOptions<LitThrottlerOptions<TFn, TSelected>>,
    selector: (state: ThrottlerState<TFn>) => TSelected = () =>
      ({}) as TSelected,
  ) {
    this.pacer = createThrottler(host, fn, options, selector)
  }
  /** Selected reactive state. Reading this property participates in host rendering. */
  get state(): Readonly<TSelected> {
    return this.pacer.state
  }
}
