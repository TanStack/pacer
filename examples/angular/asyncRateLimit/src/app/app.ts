import { Component, signal } from '@angular/core'
import { injectAsyncRateLimiter } from '@tanstack/angular-pacer'

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.html',
})
export class App {
  protected readonly logs = signal<Array<string>>([])
  protected readonly rateLimiter = injectAsyncRateLimiter(
    async (value: number) => {
      await new Promise((resolve) => setTimeout(resolve, 500))
      return `processed ${value}`
    },
    {
      limit: 3,
      window: 5000,
      windowType: 'sliding',
    },
    (state) => ({
      rejectionCount: state.rejectionCount,
    }),
  )

  protected async attempt(value: number): Promise<void> {
    try {
      const result = await this.rateLimiter.maybeExecute(value)
      this.logs.update((entries) => [`allowed: ${result}`, ...entries])
    } catch (error) {
      this.logs.update((entries) => [`blocked: ${error}`, ...entries])
    }
  }

  protected reset(): void {
    this.rateLimiter.reset()
    this.logs.set([])
  }
}
