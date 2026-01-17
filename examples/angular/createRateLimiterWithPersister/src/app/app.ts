import { Component, effect, inject, signal } from '@angular/core'
import { createRateLimiter } from '@tanstack/angular-pacer'

/**
 * Example: createRateLimiter with a persister from the Pacer context.
 *
 * This demo:
 * - Uses the default rateLimiter options from the context (including a persister if configured)
 * - Shows how executionCount and rejectionCount survive page reloads when a persister is used
 * - Lets you switch between fixed and sliding windows
 */
@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.html',
})
export class App {
  // Window type selector (not persisted here, only affects the limiter instance)
  windowType = signal<'fixed' | 'sliding'>('fixed')

  // Local UI state
  instantCount = signal(0)
  limitedCount = signal(0)

  // Snapshot of persisted state (executionCount, rejectionCount)
  persistedExecutionCount = signal(0)
  persistedRejectionCount = signal(0)

  // Rate limiter with selected reactive state
  readonly rateLimiter = createRateLimiter<
    (count: number) => void,
    { executionCount: number; rejectionCount: number }
  >(
    (count: number) => {
      this.limitedCount.set(count)
      this.updatePersistedSnapshot()
    },
    {
      // These override or complement whatever is in the context defaults
      limit: 5,
      window: 5000,
      windowType: this.windowType(),
      onReject: () => {
        this.updatePersistedSnapshot()
      },
    },
    (state) => ({
      executionCount: state.executionCount,
      rejectionCount: state.rejectionCount,
    }),
  )

  constructor() {
    // Whenever the selected state changes, refresh our persisted snapshot.
    // This makes it easy to see that the numbers survive a reload when a persister is configured.
    effect(() => {
      const { executionCount, rejectionCount } = this.rateLimiter.state()
      this.persistedExecutionCount.set(executionCount)
      this.persistedRejectionCount.set(rejectionCount)
    })
  }

  private updatePersistedSnapshot(): void {
    const { executionCount, rejectionCount } = this.rateLimiter.state()
    this.persistedExecutionCount.set(executionCount)
    this.persistedRejectionCount.set(rejectionCount)
  }

  increment(): void {
    this.instantCount.update((c) => {
      const next = c + 1
      this.rateLimiter.maybeExecute(next)
      return next
    })
  }

  resetWindow(): void {
    this.rateLimiter.reset()
    this.instantCount.set(0)
    this.limitedCount.set(0)
    this.updatePersistedSnapshot()
  }

  setWindowType(type: 'fixed' | 'sliding'): void {
    this.windowType.set(type)
  }
}
