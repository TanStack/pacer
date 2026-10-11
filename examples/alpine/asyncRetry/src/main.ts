import { asyncRetry } from '@tanstack/alpine-pacer'
import Alpine from 'alpinejs'
import { TanStackDevtoolsCore } from '@tanstack/devtools'
import { pacerDevtoolsPlugin } from '@tanstack/pacer-devtools'
interface UserData {
  id: number
  name: string
  email: string
}
class Demo {
  async fakeApi(
    userId: string,
    options: {
      shouldFail?: boolean
      shouldTimeout?: boolean
    } = {},
  ): Promise<UserData> {
    const delay = options.shouldTimeout ? 3000 : 800 // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, delay))
    if (options.shouldFail || Math.random() < 0.6) {
      throw new Error(`Network error fetching user ${userId}`)
    }
    return {
      id: parseInt(userId),
      name: `User ${userId}`,
      email: `user${userId}@example.com`,
    }
  }
  userId = '123'
  userData: UserData | null = null
  isLoading = false
  displayedError: string | null = null
  currentAttempt = 0
  scenario: 'default' | 'timeout' | 'jitter' | 'linear' = 'default'
  logs: Array<string> = []
  addLog(message: string) {
    this.logs = [
      ...this.logs.slice(-9),
      `${new Date().toLocaleTimeString()}: ${message}`,
    ]
  }
  getOptions() {
    const baseOptions = {
      onRetry: (attempt: number, error: Error) => {
        this.addLog(`Retry attempt ${attempt} after error: ${error.message}`)
        this.currentAttempt = attempt + 1
      },
      onError: (error: Error) => {
        this.addLog(`Request failed: ${error.message}`)
      },
      onLastError: (error: Error) => {
        this.addLog(`All retries exhausted: ${error.message}`)
        this.displayedError = error.message
        this.userData = null
      },
      onSuccess: (result: UserData) => {
        this.addLog(`Request succeeded for user ${result.id}`)
        this.userData = result
        this.displayedError = null
      },
      onSettled: () => {
        this.addLog('Request settled')
        this.currentAttempt = 0
      },
    }
    switch (this.scenario) {
      case 'timeout':
        return {
          ...baseOptions,
          maxAttempts: 3,
          backoff: 'exponential' as const,
          baseWait: 500,
          maxExecutionTime: 2000, // Individual call timeout
          maxTotalExecutionTime: 8000, // Total timeout for all retries
          jitter: 0,
        }
      case 'jitter':
        return {
          ...baseOptions,
          maxAttempts: 5,
          backoff: 'exponential' as const,
          baseWait: 500,
          jitter: 0.3, // 30% random variation
        }
      case 'linear':
        return {
          ...baseOptions,
          maxAttempts: 4,
          backoff: 'linear' as const,
          baseWait: 1000,
          jitter: 0,
        }
      default:
        return {
          ...baseOptions,
          maxAttempts: 5,
          backoff: 'exponential' as const,
          baseWait: 1000,
          jitter: 0,
        }
    }
  }
  async onFetchUser() {
    this.logs = []
    this.isLoading = true
    this.displayedError = null
    this.currentAttempt = 1
    this.addLog('Starting fetch operation')
    try {
      // Create retry-enabled function
      const fetchUserWithRetry = asyncRetry(async (id: string) => {
        this.addLog(`Attempting to fetch user ${id}`)
        return await this.fakeApi(id, {
          shouldTimeout: this.scenario === 'timeout',
        })
      }, this.getOptions())
      // Call the retry-enabled function
      const result = await fetchUserWithRetry(this.userId)
      this.addLog(`Final result: ${result ? `User ${result.id}` : 'undefined'}`)
    } catch (error) {
      this.addLog(
        `Caught error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
      this.displayedError =
        error instanceof Error ? error.message : 'Unknown error'
    } finally {
      this.isLoading = false
    }
  }
  onReset() {
    this.userData = null
    this.displayedError = null
    this.logs = []
    this.currentAttempt = 0
    this.addLog('State reset')
  }
  init() {}
}
Alpine.data('demo', () => new Demo())

Alpine.data('devtools', () => {
  let host: TanStackDevtoolsCore | undefined
  let target: HTMLDivElement | undefined
  return {
    init() {
      if (!import.meta.env.DEV) return
      target = document.createElement('div')
      document.body.append(target)
      host = new TanStackDevtoolsCore({ plugins: [pacerDevtoolsPlugin()] })
      host.mount(target)
    },
    destroy() {
      host?.unmount()
      target?.remove()
    },
  }
})
Alpine.start()
