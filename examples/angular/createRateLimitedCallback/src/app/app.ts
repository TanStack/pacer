import { Component, signal } from '@angular/core'
import { createRateLimitedCallback } from '@tanstack/angular-pacer'

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.html',
})
export class App {
  private run: (value: number) => boolean

  readonly rawCount = signal(0)
  readonly executedCount = signal(0)
  readonly blockedCount = signal(0)
  readonly lastExecutedValue = signal<number | null>(null)
  readonly lastExecutedAt = signal<string | null>(null)

  readonly limit = 3
  readonly windowMs = 2000

  constructor() {
    this.run = this.createLimiter()
  }

  private createLimiter() {
    return createRateLimitedCallback(
      (value: number) => {
        this.executedCount.update((current) => current + 1)
        this.lastExecutedValue.set(value)
        this.lastExecutedAt.set(new Date().toLocaleTimeString())
      },
      {
        limit: this.limit,
        window: this.windowMs,
        windowType: 'sliding',
      },
    )
  }

  trigger(): void {
    const next = this.rawCount() + 1
    this.rawCount.set(next)

    const executed = this.run(next)
    if (!executed) {
      this.blockedCount.update((current) => current + 1)
    }
  }

  reset(): void {
    this.rawCount.set(0)
    this.executedCount.set(0)
    this.blockedCount.set(0)
    this.lastExecutedValue.set(null)
    this.lastExecutedAt.set(null)
    this.run = this.createLimiter()
  }
}
