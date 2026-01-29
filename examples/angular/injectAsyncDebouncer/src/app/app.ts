import { Component, signal } from '@angular/core'
import { injectAsyncDebouncer } from '@tanstack/angular-pacer'

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly query = signal('')
  protected readonly executedQuery = signal('')
  protected readonly results = signal<Array<string>>([])

  protected readonly debouncer = injectAsyncDebouncer(
    async (q: string) => {
      await sleep(300)
      const trimmed = q.trim()
      if (!trimmed) return []

      return [`${trimmed} result 1`, `${trimmed} result 2`, `${trimmed} result 3`]
    },
    { wait: 400 },
    (state) => ({
      status: state.status,
      isPending: state.isPending,
      isExecuting: state.isExecuting,
      errorCount: state.errorCount,
    }),
  )

  protected async onQueryInput(value: string): Promise<void> {
    this.query.set(value)

    const next = await this.debouncer.maybeExecute(value)
    if (next !== undefined) {
      this.executedQuery.set(value)
      this.results.set(next)
    }
  }

  protected clear(): void {
    this.query.set('')
    this.executedQuery.set('')
    this.results.set([])
    this.debouncer.reset()
  }
}
