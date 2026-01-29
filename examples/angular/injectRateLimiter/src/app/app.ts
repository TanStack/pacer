import { Component, signal } from '@angular/core'
import { injectRateLimiter } from '@tanstack/angular-pacer'

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.html',
})
export class App {
  protected readonly logs = signal<Array<string>>([])
  protected readonly rateLimiter = injectRateLimiter(
    () => {
      this.logs.update((entries) => [`allowed @ ${new Date().toLocaleTimeString()}`, ...entries])
    },
    {
      limit: 3,
      window: 5000,
      windowType: 'sliding',
      onReject: () => {
        this.logs.update((entries) => [`blocked @ ${new Date().toLocaleTimeString()}`, ...entries])
      },
    },
    (state) => ({
      executionCount: state.executionCount,
      rejectionCount: state.rejectionCount,
    }),
  )

  protected attempt(): void {
    this.rateLimiter.maybeExecute()
  }

  protected reset(): void {
    this.rateLimiter.reset()
    this.logs.set([])
  }

  protected remaining(): number {
    return this.rateLimiter.getRemainingInWindow()
  }
}
