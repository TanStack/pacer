import { createAsyncQueuer } from './createAsyncQueuer'
import type { LitAsyncQueuer, LitAsyncQueuerOptions } from './createAsyncQueuer'
import type { LitPacerOptions } from '../types'
import type { ReactiveControllerHost } from 'lit'
import type { AsyncQueuerState } from '@tanstack/pacer/async-queuer'

/** Owns a AsyncQueuer for a Lit host. Access core methods and selected state through `pacer`. */
export class AsyncQueuerController<TValue, TSelected = {}> {
  readonly pacer: LitAsyncQueuer<TValue, TSelected>
  constructor(
    host: ReactiveControllerHost,
    fn: (item: TValue) => Promise<any>,
    options: LitPacerOptions<LitAsyncQueuerOptions<TValue, TSelected>> = {},
    selector: (state: AsyncQueuerState<TValue>) => TSelected = () =>
      ({}) as TSelected,
  ) {
    this.pacer = createAsyncQueuer(host, fn, options, selector)
  }
  /** Selected reactive state. Reading this property participates in host rendering. */
  get state(): Readonly<TSelected> {
    return this.pacer.state
  }
}
