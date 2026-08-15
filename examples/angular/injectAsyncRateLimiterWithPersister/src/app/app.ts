import { Component, signal } from '@angular/core'
import { RouterOutlet } from '@angular/router'
import { injectRateLimiter } from '@tanstack/angular-pacer'

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly windowType = signal<'fixed' | 'sliding'>('fixed')
  protected readonly instantCount = signal(0)
  protected readonly limitedCount = signal(0)
  protected readonly executionHistory: Array<{
    timestamp: string
    count: number
    rejected: boolean
  }> = []

  // Rate limiter: allows 5 executions per 5 seconds
  protected readonly rateLimiter = injectRateLimiter<
    (count: number) => void,
    {
      executionCount: number
      rejectionCount: number
      executionTimes: Array<number>
    }
  >(
    (count: number) => {
      console.log('Rate-limited execution:', count)
      this.limitedCount.set(count)
      this.executionHistory.push({
        timestamp: new Date().toLocaleTimeString(),
        count,
        rejected: false,
      })
    },
    {
      limit: 5,
      window: 5000, // 5 seconds
      windowType: this.windowType(),
      onReject: () => {
        console.log('Rejected by rate limiter', this.rateLimiter.getMsUntilNextWindow())
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

  protected increment(): void {
    // Update instant count immediately
    this.instantCount.update((c) => {
      const newCount = c + 1
      // Try to execute with rate limiter
      this.rateLimiter.maybeExecute(newCount)
      return newCount
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
    // Note: windowType change requires recreating the rate limiter in a real app
    // For this example, we'll just update the signal
  }
}
