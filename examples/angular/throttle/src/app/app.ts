import { Component, signal } from '@angular/core'

import { injectThrottler } from '@tanstack/angular-pacer'

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.html',
})
export class App {
  protected readonly instantCount = signal(0)
  protected readonly throttledCount = signal(0)

  // Throttler: executes at most once per second
  protected readonly throttler = injectThrottler(
    () => {
      console.log('Throttled execution')
      this.throttledCount.set(this.instantCount())
    },
    {
      wait: 1000, // 1 second
    },
    (state) => ({
      isPending: state.isPending,
      executionCount: state.executionCount,
    }),
  )

  protected increment(): void {
    this.instantCount.update((c) => c + 1)
    this.throttler.maybeExecute()
  }
}
