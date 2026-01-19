import { Component, signal } from '@angular/core'
import { RouterOutlet } from '@angular/router'
import { injectRateLimitedValue } from '@tanstack/angular-pacer'

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly windowType = signal<'fixed' | 'sliding'>('fixed')

  // This is the "source" value that changes immediately on every click
  protected readonly instantCount = signal(0)

  // We'll display the rate-limited version of `instantCount` in the UI
  protected readonly limitedCount = signal(0)

  protected readonly executionHistory: Array<{
    timestamp: string
    count: number
    rejected: boolean
  }> = []

  // Rate-limited value: allows 5 updates per 5 seconds
  protected readonly rateLimited = injectRateLimitedValue<
    number,
    {
      executionCount: number
      rejectionCount: number
      executionTimes: Array<number>
    }
  >(
    this.instantCount,
    {
      limit: 5,
      window: 5000, // 5 seconds
      windowType: this.windowType(),
      onReject: () => {
        // The value update was rejected; log the attempted value
        this.executionHistory.push({
          timestamp: new Date().toLocaleTimeString(),
          count: this.instantCount(),
          rejected: true,
        })
      },
    },
    (state) => ({
      executionCount: state.executionCount,
      rejectionCount: state.rejectionCount,
      executionTimes: state.executionTimes,
    }),
  )

  // Convenience accessors for the template (matches the old names)
  protected readonly rateLimiter = this.rateLimited.rateLimiter
  protected readonly rateLimitedCount = this.rateLimited

  protected increment(): void {
    // Update instant count immediately; rateLimited value tracks it automatically
    this.instantCount.update((c) => c + 1)

    // If the update was accepted, reflect the latest rate-limited value + log it
    // (Rejected updates are logged via `onReject`)
    this.limitedCount.set(this.rateLimitedCount())
    this.executionHistory.push({
      timestamp: new Date().toLocaleTimeString(),
      count: this.rateLimitedCount(),
      rejected: false,
    })
  }

  protected reset(): void {
    this.rateLimiter.reset()
    this.instantCount.set(0)
    this.limitedCount.set(0)
    this.executionHistory.length = 0
  }

  protected setWindowType(type: 'fixed' | 'sliding'): void {
    this.windowType.set(type)
    // Note: windowType change requires recreating the rate limiter in a real app.
    // For this example, we just update the signal.
  }
}
