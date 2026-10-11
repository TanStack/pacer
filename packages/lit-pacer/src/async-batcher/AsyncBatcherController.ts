import { createAsyncBatcher } from './createAsyncBatcher'
import type {
  LitAsyncBatcher,
  LitAsyncBatcherOptions,
} from './createAsyncBatcher'
import type { LitPacerOptions } from '../types'
import type { ReactiveControllerHost } from 'lit'
import type { AsyncBatcherState } from '@tanstack/pacer/async-batcher'

/** Owns a AsyncBatcher for a Lit host. Access core methods and selected state through `pacer`. */
export class AsyncBatcherController<TValue, TSelected = {}> {
  readonly pacer: LitAsyncBatcher<TValue, TSelected>
  constructor(
    host: ReactiveControllerHost,
    fn: (items: Array<TValue>) => Promise<any>,
    options: LitPacerOptions<LitAsyncBatcherOptions<TValue, TSelected>> = {},
    selector: (state: AsyncBatcherState<TValue>) => TSelected = () =>
      ({}) as TSelected,
  ) {
    this.pacer = createAsyncBatcher(host, fn, options, selector)
  }
  /** Selected reactive state. Reading this property participates in host rendering. */
  get state(): Readonly<TSelected> {
    return this.pacer.state
  }
}
