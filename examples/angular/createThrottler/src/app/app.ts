import { Component, signal } from '@angular/core'
import { createThrottler } from '@tanstack/angular-pacer'

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
})
export class App {
  protected readonly instant = signal(0)
  protected readonly throttled = signal(0)

  protected readonly throttler = createThrottler(
    () => this.throttled.set(this.instant()),
    { wait: 1000 },
    (s) => ({
      status: s.status,
      isPending: s.isPending,
      executionCount: s.executionCount,
    }),
  )

  protected increment(): void {
    this.instant.update((v) => v + 1)
    this.throttler.maybeExecute()
  }
}
