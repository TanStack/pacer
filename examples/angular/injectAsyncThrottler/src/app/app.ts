import { Component, signal } from '@angular/core'
import { RouterOutlet } from '@angular/router'
import { injectAsyncThrottler } from '@tanstack/angular-pacer'

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly query = signal('hello')
  protected readonly lastEvent = signal<'executed' | 'throttled' | 'error' | null>(null)
  protected readonly lastValue = signal<string | null>(null)

  protected readonly throttler = injectAsyncThrottler(
    async (q: string) => {
      await sleep(600)
      return `Response for "${q}" @ ${new Date().toLocaleTimeString()}`
    },
    { wait: 1000 },
    (state) => state,
  )

  protected async run(): Promise<void> {
    this.lastEvent.set(null)
    try {
      const result = await this.throttler.maybeExecute(this.query())

      if (result === undefined) {
        this.lastEvent.set('throttled')
        return
      }

      this.lastEvent.set('executed')
      this.lastValue.set(String(result))
    } catch (err) {
      this.lastEvent.set('error')
      this.lastValue.set(err instanceof Error ? err.message : String(err))
    }
  }

  protected reset(): void {
    this.throttler.reset()
    this.lastEvent.set(null)
    this.lastValue.set(null)
  }
}
