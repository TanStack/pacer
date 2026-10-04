import { createBatcher } from './createBatcher'
import type { LitBatcher, LitBatcherOptions } from './createBatcher'
import type { LitPacerOptions } from '../types'
import type { ReactiveControllerHost } from 'lit'
import type { BatcherState } from '@tanstack/pacer/batcher'

/** Owns a Batcher for a Lit host. Access core methods and selected state through `pacer`. */
export class BatcherController<TValue, TSelected = {}> {
  readonly pacer: LitBatcher<TValue, TSelected>
  constructor(
    host: ReactiveControllerHost,
    fn: (items: Array<TValue>) => void,
    options: LitPacerOptions<LitBatcherOptions<TValue, TSelected>> = {},
    selector: (state: BatcherState<TValue>) => TSelected = () =>
      ({}) as TSelected,
  ) {
    this.pacer = createBatcher(host, fn, options, selector)
  }
  /** Selected reactive state. Reading this property participates in host rendering. */
  get state(): Readonly<TSelected> {
    return this.pacer.state
  }
}
