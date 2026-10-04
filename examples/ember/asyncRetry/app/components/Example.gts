import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { on } from '@ember/modifier'
import { asyncRetry } from '@tanstack/ember-pacer'
import { htmlSafe } from '@ember/template'
interface UserData {
  id: number
  name: string
  email: string
}
const space = ' '
const gt = (a: number, b: number) => a > b
const eq = (a: unknown, b: unknown) => a === b
export default class Example extends Component {
  fakeApi = async (
    userId: string,
    options: {
      shouldFail?: boolean
      shouldTimeout?: boolean
    } = {},
  ): Promise<UserData> => {
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
  @tracked userId = '123'
  @tracked userData: UserData | null = null
  @tracked isLoading = false
  @tracked displayedError: string | null = null
  @tracked currentAttempt = 0
  @tracked scenario: 'default' | 'timeout' | 'jitter' | 'linear' = 'default'
  @tracked logs: Array<string> = []
  addLog = (message: string) => {
    this.logs = [
      ...this.logs.slice(-9),
      `${new Date().toLocaleTimeString()}: ${message}`,
    ]
  }
  getOptions = () => {
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
  onFetchUser = async () => {
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
  onReset = () => {
    this.userData = null
    this.displayedError = null
    this.logs = []
    this.currentAttempt = 0
    this.addLog('State reset')
  }
  updateScenario = (e: Event) => {
    this.scenario = (e.target as HTMLInputElement).value as typeof this.scenario
  }
  updateUserId = (e: Event) => {
    this.userId = (e.target as HTMLInputElement).value
  }
  get currentOptionsJson() {
    return (() => {
      const opts = this.getOptions()
      return JSON.stringify(
        {
          maxAttempts: opts.maxAttempts,
          backoff: opts.backoff,
          baseWait: opts.baseWait,
          jitter: opts.jitter,
          maxExecutionTime:
            'maxExecutionTime' in opts ? opts.maxExecutionTime : Infinity,
          maxTotalExecutionTime:
            'maxTotalExecutionTime' in opts
              ? opts.maxTotalExecutionTime
              : Infinity,
        },
        null,
        2,
      )
    })()
  }
  get statusStyle() {
    const styles = {
      padding: '2px 8px',
      borderRadius: '3px',
      backgroundColor: this.isLoading
        ? this.currentAttempt > 1
          ? '#ff8c00'
          : '#ffd700'
        : '#90ee90',
    }
    return htmlSafe(
      Object.entries(styles)
        .map(
          ([property, value]) =>
            property.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase()) +
            ': ' +
            value,
        )
        .join('; '),
    )
  }
  get maxAttempts() {
    return (() => {
      const opts = this.getOptions()
      return opts.maxAttempts
    })()
  }
  <template>
    <div style='padding: 20px; max-width: 1200px; margin: 0 auto'><h1>TanStack
        Pacer asyncRetry Example</h1><p>
        Demonstrates the asyncRetry utility function with configurable backoff
        strategies, timeouts, jitter, and error handling.
      </p><div
        style='display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px'
      ><div><h3>Configuration</h3><div style='margin-bottom: 10px'><label
              style='display: block; margin-bottom: 5px'
            >Scenario:</label><select
              value={{this.scenario}}
              {{on 'input' this.updateScenario}}
              style='padding: 5px; width: 100%'
              disabled={{this.isLoading}}
            ><option value='default'>Default (Exponential Backoff)</option><option
                value='timeout'
              >With Timeouts</option><option value='jitter'>With Jitter (30%)</option><option
                value='linear'
              >Linear Backoff</option></select></div><div
            style='margin-bottom: 10px'
          ><label style='display: block; margin-bottom: 5px'>User ID:</label><input
              type='text'
              value={{this.userId}}
              {{on 'input' this.updateUserId}}
              placeholder='Enter user ID...'
              style='padding: 5px; width: 100%'
              disabled={{this.isLoading}}
            /></div><div
            style='display: grid; grid-template-columns: 1fr 1fr; gap: 10px'
          ><button
              {{on 'click' this.onFetchUser}}
              disabled={{this.isLoading}}
              style='padding: 10px'
            >{{if this.isLoading 'Fetching...' 'Fetch User'}}</button><button
              {{on 'click' this.onReset}}
              style='padding: 10px'
            >Reset</button></div><div
            style='margin-top: 20px; padding: 15px; background-color: #f5f5f5; border-radius: 5px'
          ><h4>Current Options:</h4><pre
              style='font-size: 12px; margin: 0'
            >{{this.currentOptionsJson}}</pre></div></div><div><h3
          >State</h3><div
            style='padding: 15px; background-color: #f5f5f5; border-radius: 5px'
          ><div style='margin-bottom: 10px'><strong
              >Status:</strong>{{space}}<span style={{this.statusStyle}}>{{if
                  this.isLoading
                  (if (gt this.currentAttempt 1) 'retrying' 'executing')
                  'idle'
                }}</span></div>{{#if (gt this.currentAttempt 0)}}<p><strong
                >Current Attempt:</strong>
                {{this.currentAttempt}}
                /{{space}}{{this.maxAttempts}}</p>{{/if}}{{#if
              this.displayedError
            }}<div
                style='margin-top: 10px; padding: 10px; background-color: #ffe6e6; border-radius: 5px; color: #d32f2f'
              ><strong>Error:</strong><br
                />{{this.displayedError}}</div>{{/if}}</div>{{#if
            this.userData
          }}<div
              style='margin-top: 20px; padding: 15px; background-color: #e6f7ff; border-radius: 5px'
            ><h4>User Data:</h4><p><strong>ID:</strong>
                {{this.userData.id}}</p><p><strong>Name:</strong>
                {{this.userData.name}}</p><p><strong>Email:</strong>
                {{this.userData.email}}</p></div>{{/if}}</div></div><div
        style='margin-top: 20px'
      ><h3>Activity Log</h3><div
          style='padding: 15px; background-color: #f5f5f5; border-radius: 5px; max-height: 200px; overflow-y: auto; font-family: monospace; font-size: 12px'
        >{{#if (eq this.logs.length 0)}}<div style='color: #999'>No activity yet</div>{{else}}{{#each
              this.logs
              as |log i|
            }}<div
                style='margin-bottom: 5px'
              >{{log}}</div>{{/each}}{{/if}}</div></div><div
        style='margin-top: 20px; padding: 15px; background-color: #fff3cd; border-radius: 5px; font-size: 14px'
      ><strong>Note:</strong>
        This example uses the
        <code>asyncRetry</code>{{space}}utility function, which creates a
        retry-enabled version of your async function. Each call to the
        retry-enabled function creates a fresh retry context.
      </div><div
        style='margin-top: 20px; padding: 15px; background-color: #e3f2fd; border-radius: 5px; font-size: 12px'
      ><strong>Key Features:</strong><ul
          style='margin-top: 10px; margin-bottom: 0'
        ><li><strong>Exponential Backoff:</strong>
            Wait time doubles with each retry (1s, 2s, 4s, ...)
          </li><li><strong>Linear Backoff:</strong>
            Wait time increases linearly (1s, 2s, 3s, ...)
          </li><li><strong>Jitter:</strong>
            Adds randomness to prevent thundering herd problems
          </li><li><strong>Timeouts:</strong>
            Control individual and total execution time
          </li></ul></div></div>
  </template>
}
