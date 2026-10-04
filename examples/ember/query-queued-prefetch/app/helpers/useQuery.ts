import Helper from '@ember/component/helper'
import {
  isDestroyed,
  isDestroying,
  registerDestructor,
} from '@ember/destroyable'
import { scheduleOnce } from '@ember/runloop'
import { trackedObject } from '@ember/reactive/collections'
import { QueryObserver } from '@tanstack/query-core'
import { queryClient } from '../api'
import type {
  QueryObserverOptions,
  QueryObserverResult,
} from '@tanstack/query-core'

/** Own a Query Core observer for one template invocation. */
class UseQuery<TData> extends Helper<{
  Args: { Positional: [options: QueryObserverOptions<TData>] }
  Return: { readonly current: QueryObserverResult<TData> }
}> {
  private observer?: QueryObserver<TData>
  private result?: { current: QueryObserverResult<TData> }
  private options?: QueryObserverOptions<TData>
  private unsubscribe?: () => void

  compute([options]: [QueryObserverOptions<TData>]) {
    this.options = options
    if (!this.observer) {
      this.observer = new QueryObserver(queryClient, options)
      this.result = trackedObject({ current: this.observer.getCurrentResult() })
      registerDestructor(this, () => {
        this.unsubscribe?.()
        this.observer?.destroy()
      })
    }
    // Fetches may notify synchronously. Subscribe after the template has rendered.
    scheduleOnce('afterRender', this, this.update)
    return this.result!
  }

  private update() {
    if (
      isDestroyed(this) ||
      isDestroying(this) ||
      !this.observer ||
      !this.options
    )
      return
    this.observer.setOptions(this.options)
    this.unsubscribe ??= this.observer.subscribe((current) => {
      this.result!.current = current
    })
  }
}
export { UseQuery as useQuery }
