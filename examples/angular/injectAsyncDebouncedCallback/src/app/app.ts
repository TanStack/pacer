import { Component, signal } from '@angular/core'
import { injectAsyncDebouncedCallback } from '@tanstack/angular-pacer'

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
  protected readonly query = signal('')
  protected readonly isExecuting = signal(false)
  protected readonly lastOutcome = signal<'idle' | 'executed' | 'debounced'>('idle')
  protected readonly lastResult = signal<string | null>(null)

  protected readonly history: Array<HistoryEntry> = []

  protected readonly search = injectAsyncDebouncedCallback(
    async (query: string) => {
      this.isExecuting.set(true)
      try {
        await new Promise<void>((resolve) => setTimeout(resolve, 300))
        const result = `results-for:${query}`
        this.lastResult.set(result)
        return result
      } finally {
        this.isExecuting.set(false)
      }
    },
    {
      wait: 600,
    },
  )

  protected onQueryInput(value: string): void {
    this.query.set(value)
    void this.attempt(value)
  }

  protected runBurst(): void {
    const parts = ['t', 'ta', 'tan', 'tans', 'tanst', 'tansta', 'tanstack']
    for (const q of parts) {
      this.query.set(q)
      void this.attempt(q)
    }
  }

  protected reset(): void {
    this.query.set('')
    this.isExecuting.set(false)
    this.lastOutcome.set('idle')
    this.lastResult.set(null)
    this.history.length = 0
  }

  private async attempt(query: string): Promise<void> {
    const timestamp = new Date().toLocaleTimeString()

    const result = await this.search(query)

    if (result === undefined) {
      this.lastOutcome.set('debounced')
      this.history.unshift({ timestamp, value: query, executed: false })
      return
    }

    this.lastOutcome.set('executed')
    this.history.unshift({ timestamp, value: query, executed: true, result })
  }
}
