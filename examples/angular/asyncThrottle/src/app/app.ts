import { Component, signal } from '@angular/core'
import { injectAsyncThrottler } from '@tanstack/angular-pacer'

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.html',
})
export class App {
  protected readonly logs = signal<string[]>([])
  protected readonly throttler = injectAsyncThrottler(
    async (value: number) => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return `processed ${value}`
    },
    { wait: 2000 },
    (state) => ({ isExecuting: state.isExecuting, isPending: state.isPending }),
  )

  protected async attempt(value: number): Promise<void> {
    try {
      const result = await this.throttler.maybeExecute(value)
      this.logs.update((entries) => [`result: ${result}`, ...entries])
    } catch (error) {
      this.logs.update((entries) => [`error: ${error}`, ...entries])
    }
  }

  protected reset(): void {
    this.throttler.reset()
    this.logs.set([])
  }
}
