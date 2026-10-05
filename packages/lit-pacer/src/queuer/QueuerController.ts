import { createQueuer } from './createQueuer'
import type { LitQueuer, LitQueuerOptions } from './createQueuer'
import type { LitPacerOptions } from '../types'
import type { ReactiveControllerHost } from 'lit'
import type { QueuerState } from '@tanstack/pacer/queuer'

/** Owns a Queuer for a Lit host. Access core methods and selected state through `pacer`. */
export class QueuerController<TValue, TSelected = {}> {
  readonly pacer: LitQueuer<TValue, TSelected>
  constructor(
    host: ReactiveControllerHost,
    fn: (item: TValue) => void,
    options: LitPacerOptions<LitQueuerOptions<TValue, TSelected>> = {},
    selector: (state: QueuerState<TValue>) => TSelected = () =>
      ({}) as TSelected,
  ) {
    this.pacer = createQueuer(host, fn, options, selector)
  }
  /** Selected reactive state. Reading this property participates in host rendering. */
  get state(): Readonly<TSelected> {
    return this.pacer.state
  }
}
