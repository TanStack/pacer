import { Component, signal } from '@angular/core'
import { injectAsyncRateLimiter } from '@tanstack/angular-pacer'

type HistoryEntry = {
  timestamp: string
  value: string
  executed: boolean
  result?: string
}

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly value = signal('')
  protected readonly lastOutcome = signal<'idle' | 'executed' | 'rejected'>('idle')
  protected readonly lastResult = signal<string | null>(null)

  protected readonly history: Array<HistoryEntry> = []

  private nextId = 1

  protected readonly rateLimiter = injectAsyncRateLimiter(
    async (value: string) => {
      await new Promise<void>((resolve) => setTimeout(resolve, 400))
      return `saved:${value}`
    },
    {
      limit: 3,
      window: 2000,
      windowType: 'fixed',
    },
    (state) => ({
      status: state.status,
      isExecuting: state.isExecuting,
      successCount: state.successCount,
      rejectionCount: state.rejectionCount,
      maybeExecuteCount: state.maybeExecuteCount,
    }),
  )

  protected runOnce(): void {
    const v = this.value().trim() || `value-${this.nextId++}`
    this.value.set(v)
    void this.attempt(v)
  }

  protected runBurst(count: number): void {
    for (let i = 0; i < count; i++) {
      void this.attempt(`value-${this.nextId++}`)
    }
  }

  protected reset(): void {
    this.value.set('')
    this.lastOutcome.set('idle')
    this.lastResult.set(null)
    this.history.length = 0
    this.nextId = 1
    this.rateLimiter.reset()
  }

  private async attempt(value: string): Promise<void> {
    const timestamp = new Date().toLocaleTimeString()

    const result = await this.rateLimiter.maybeExecute(value)

    if (result === undefined) {
      this.lastOutcome.set('rejected')
      this.history.unshift({ timestamp, value, executed: false })
      return
    }

    this.lastOutcome.set('executed')
    this.lastResult.set(result)
    this.history.unshift({ timestamp, value, executed: true, result })
  }
}
