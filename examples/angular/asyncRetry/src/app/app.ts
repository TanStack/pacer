import { Component, computed, signal } from '@angular/core'
import { JsonPipe } from '@angular/common'
import { asyncRetry } from '@tanstack/angular-pacer'

type Scenario = 'default' | 'timeout' | 'jitter' | 'linear'
type UserData = { id: number; name: string; email: string }

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  imports: [JsonPipe],
})
export class App {
  readonly userId = signal('123')
  readonly userData = signal<UserData | null>(null)
  readonly isLoading = signal(false)
  readonly error = signal('')
  readonly currentAttempt = signal(0)
  readonly scenario = signal<Scenario>('default')
  readonly logs = signal<Array<string>>([])
  readonly options = computed(() => {
    switch (this.scenario()) {
      case 'timeout':
        return {
          maxAttempts: 3,
          backoff: 'exponential' as const,
          baseWait: 500,
          maxExecutionTime: 2000,
          maxTotalExecutionTime: 8000,
          jitter: 0,
        }
      case 'jitter':
        return {
          maxAttempts: 5,
          backoff: 'exponential' as const,
          baseWait: 500,
          jitter: 0.3,
        }
      case 'linear':
        return {
          maxAttempts: 4,
          backoff: 'linear' as const,
          baseWait: 1000,
          jitter: 0,
        }
      default:
        return {
          maxAttempts: 5,
          backoff: 'exponential' as const,
          baseWait: 1000,
          jitter: 0,
        }
    }
  })
  private log(message: string): void {
    this.logs.update((logs) => [
      ...logs.slice(-9),
      `${new Date().toLocaleTimeString()}: ${message}`,
    ])
  }
  setScenario(value: string): void {
    if (
      value === 'default' ||
      value === 'timeout' ||
      value === 'jitter' ||
      value === 'linear'
    )
      this.scenario.set(value)
  }
  async fetchUser(): Promise<void> {
    this.logs.set([])
    this.isLoading.set(true)
    this.error.set('')
    this.currentAttempt.set(1)
    this.log('Starting fetch operation')
    const scenario = this.scenario()
    const fetchWithRetry = asyncRetry(
      async (id: string): Promise<UserData> => {
        this.log(`Attempting to fetch user ${id}`)
        await new Promise((resolve) =>
          setTimeout(resolve, scenario === 'timeout' ? 3000 : 800),
        )
        if (Math.random() < 0.6)
          throw new Error(`Network error fetching user ${id}`)
        return {
          id: Number.parseInt(id),
          name: `User ${id}`,
          email: `user${id}@example.com`,
        }
      },
      {
        ...this.options(),
        onRetry: (attempt, error) => {
          this.log(`Retry attempt ${attempt} after error: ${error.message}`)
          this.currentAttempt.set(attempt + 1)
        },
        onError: (error) => this.log(`Request failed: ${error.message}`),
        onLastError: (error) => {
          this.log(`All retries exhausted: ${error.message}`)
          this.error.set(error.message)
          this.userData.set(null)
        },
        onSuccess: (result) => {
          this.log(`Request succeeded for user ${result.id}`)
          this.userData.set(result)
          this.error.set('')
        },
        onSettled: () => {
          this.log('Request settled')
          this.currentAttempt.set(0)
        },
      },
    )
    try {
      const result = await fetchWithRetry(this.userId())
      this.log(`Final result: ${result ? `User ${result.id}` : 'undefined'}`)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      this.error.set(message)
      this.log(`Caught error: ${message}`)
    } finally {
      this.isLoading.set(false)
    }
  }
  reset(): void {
    this.userData.set(null)
    this.error.set('')
    this.logs.set([])
    this.currentAttempt.set(0)
    this.log('State reset')
  }
}
