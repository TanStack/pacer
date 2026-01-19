import { Component, effect } from '@angular/core'
import { injectThrottledSignal } from '@tanstack/angular-pacer'

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.html',
})
export class App {
  // Throttled counter value
  count = 0

  // Raw click count (not throttled)
  rawCount = 0

  // Throttled state signals
  readonly throttledState: ReturnType<
    typeof injectThrottledSignal<number, { executionCount: number; isPending: boolean }>
  >

  constructor() {
    this.throttledState = injectThrottledSignal(
      0,
      {
        wait: 500,
        leading: true,
        trailing: true,
      },
      (state) => ({
        executionCount: state.executionCount,
        isPending: state.isPending,
      }),
    )

    const throttledCount = this.throttledState

    effect(() => {
      this.count = throttledCount()
    })
  }

  onClick() {
    this.rawCount++
    this.throttledState.set((prev) => prev + 1)
  }

  reset() {
    this.rawCount = 0
    this.throttledState.set(0)
  }

  get executionCount() {
    const throttler = this.throttledState.throttler
    return throttler.state().executionCount
  }

  get isPending() {
    const throttler = this.throttledState.throttler
    return throttler.state().isPending
  }
}
