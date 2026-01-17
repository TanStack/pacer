import { Component, effect } from '@angular/core'
import { createThrottledSignal } from '@tanstack/angular-pacer'

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
    typeof createThrottledSignal<number, { executionCount: number; isPending: boolean }>
  >

  constructor() {
    this.throttledState = createThrottledSignal(
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

    const [throttledCount] = this.throttledState

    effect(() => {
      this.count = throttledCount()
    })
  }

  onClick() {
    const [, setCount] = this.throttledState

    this.rawCount++
    setCount((prev) => prev + 1)
  }

  reset() {
    const [_, setThrottledCount] = this.throttledState

    this.rawCount = 0
    setThrottledCount(0)
  }

  get executionCount() {
    const [, , throttler] = this.throttledState
    return throttler.state().executionCount
  }

  get isPending() {
    const [, , throttler] = this.throttledState
    return throttler.state().isPending
  }
}
