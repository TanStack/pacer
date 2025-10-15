import { useState, useRef } from 'react'
import ReactDOM from 'react-dom/client'
import { asyncRetry } from '@tanstack/react-pacer/async-retryer'

interface UserData {
  id: number
  name: string
  email: string
}

// Simulate API call with fake data that can fail or timeout
const fakeApi = async (
  userId: string,
  options: { shouldFail?: boolean; shouldTimeout?: boolean } = {},
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

function App() {
  const [userId, setUserId] = useState('123')
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentAttempt, setCurrentAttempt] = useState(0)
  const [scenario, setScenario] = useState<
    'default' | 'timeout' | 'jitter' | 'linear'
  >('default')
  const [logs, setLogs] = useState<string[]>([])
  const abortControllerRef = useRef<AbortController | null>(null)

  const addLog = (message: string) => {
    setLogs((prev) => [
      ...prev.slice(-9),
      `${new Date().toLocaleTimeString()}: ${message}`,
    ])
  }

  // Get options based on selected scenario
  const getOptions = () => {
    const baseOptions = {
      onRetry: (attempt: number, error: Error) => {
        addLog(`Retry attempt ${attempt} after error: ${error.message}`)
        setCurrentAttempt(attempt + 1)
      },
      onError: (error: Error) => {
        addLog(`Request failed: ${error.message}`)
      },
      onLastError: (error: Error) => {
        addLog(`All retries exhausted: ${error.message}`)
        setError(error.message)
        setUserData(null)
      },
      onSuccess: async (result: Promise<UserData>) => {
        const data = await result
        addLog(`Request succeeded for user ${data.id}`)
        setUserData(data)
        setError(null)
      },
      onSettled: () => {
        addLog('Request settled')
        setCurrentAttempt(0)
      },
    }

    switch (scenario) {
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

  // Create the retry-wrapped function
  const fetchUserWithRetry = asyncRetry(async (id: string) => {
    addLog(`Attempting to fetch user ${id}`)
    return await fakeApi(id, {
      shouldTimeout: scenario === 'timeout',
    })
  }, getOptions())

  // Handle fetch with abort support
  async function onFetchUser() {
    setLogs([])
    setIsLoading(true)
    setError(null)
    setCurrentAttempt(1)
    addLog('Starting fetch operation')

    // Create abort controller
    abortControllerRef.current = new AbortController()

    try {
      const result = await fetchUserWithRetry(userId)
      addLog(`Final result: ${result ? `User ${result.id}` : 'undefined'}`)
    } catch (error) {
      addLog(
        `Caught error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
      setError(error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setIsLoading(false)
      abortControllerRef.current = null
    }
  }

  function onAbort() {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      addLog('Operation aborted by user')
      setIsLoading(false)
      setCurrentAttempt(0)
    }
  }

  function onReset() {
    setUserData(null)
    setError(null)
    setLogs([])
    setCurrentAttempt(0)
    addLog('State reset')
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>TanStack Pacer asyncRetry Example</h1>
      <p>
        Demonstrates the asyncRetry utility function with configurable backoff
        strategies, timeouts, jitter, and error handling.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px',
          marginTop: '20px',
        }}
      >
        <div>
          <h3>Configuration</h3>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              Scenario:
            </label>
            <select
              value={scenario}
              onChange={(e) => setScenario(e.target.value as typeof scenario)}
              style={{ padding: '5px', width: '100%' }}
              disabled={isLoading}
            >
              <option value="default">Default (Exponential Backoff)</option>
              <option value="timeout">With Timeouts</option>
              <option value="jitter">With Jitter (30%)</option>
              <option value="linear">Linear Backoff</option>
            </select>
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              User ID:
            </label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter user ID..."
              style={{ padding: '5px', width: '100%' }}
              disabled={isLoading}
            />
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '10px',
            }}
          >
            <button
              onClick={onFetchUser}
              disabled={isLoading}
              style={{ padding: '10px' }}
            >
              {isLoading ? 'Fetching...' : 'Fetch User'}
            </button>
            <button
              onClick={onAbort}
              disabled={!isLoading}
              style={{ padding: '10px' }}
            >
              Abort
            </button>
            <button onClick={onReset} style={{ padding: '10px' }}>
              Reset
            </button>
          </div>

          <div
            style={{
              marginTop: '20px',
              padding: '15px',
              backgroundColor: '#f5f5f5',
              borderRadius: '5px',
            }}
          >
            <h4>Current Options:</h4>
            <pre style={{ fontSize: '12px', margin: 0 }}>
              {(() => {
                const opts = getOptions()
                return JSON.stringify(
                  {
                    maxAttempts: opts.maxAttempts,
                    backoff: opts.backoff,
                    baseWait: opts.baseWait,
                    jitter: opts.jitter,
                    maxExecutionTime:
                      'maxExecutionTime' in opts
                        ? opts.maxExecutionTime
                        : Infinity,
                    maxTotalExecutionTime:
                      'maxTotalExecutionTime' in opts
                        ? opts.maxTotalExecutionTime
                        : Infinity,
                  },
                  null,
                  2,
                )
              })()}
            </pre>
          </div>
        </div>

        <div>
          <h3>State</h3>
          <div
            style={{
              padding: '15px',
              backgroundColor: '#f5f5f5',
              borderRadius: '5px',
            }}
          >
            <div style={{ marginBottom: '10px' }}>
              <strong>Status:</strong>{' '}
              <span
                style={{
                  padding: '2px 8px',
                  borderRadius: '3px',
                  backgroundColor: isLoading
                    ? currentAttempt > 1
                      ? '#ff8c00'
                      : '#ffd700'
                    : '#90ee90',
                }}
              >
                {isLoading
                  ? currentAttempt > 1
                    ? 'retrying'
                    : 'executing'
                  : 'idle'}
              </span>
            </div>
            {currentAttempt > 0 && (
              <p>
                <strong>Current Attempt:</strong> {currentAttempt} /{' '}
                {(() => {
                  const opts = getOptions()
                  return opts.maxAttempts
                })()}
              </p>
            )}
            {error && (
              <div
                style={{
                  marginTop: '10px',
                  padding: '10px',
                  backgroundColor: '#ffe6e6',
                  borderRadius: '5px',
                  color: '#d32f2f',
                }}
              >
                <strong>Error:</strong>
                <br />
                {error}
              </div>
            )}
          </div>

          {userData && (
            <div
              style={{
                marginTop: '20px',
                padding: '15px',
                backgroundColor: '#e6f7ff',
                borderRadius: '5px',
              }}
            >
              <h4>User Data:</h4>
              <p>
                <strong>ID:</strong> {userData.id}
              </p>
              <p>
                <strong>Name:</strong> {userData.name}
              </p>
              <p>
                <strong>Email:</strong> {userData.email}
              </p>
            </div>
          )}
        </div>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h3>Activity Log</h3>
        <div
          style={{
            padding: '15px',
            backgroundColor: '#f5f5f5',
            borderRadius: '5px',
            maxHeight: '200px',
            overflowY: 'auto',
            fontFamily: 'monospace',
            fontSize: '12px',
          }}
        >
          {logs.length === 0 ? (
            <div style={{ color: '#999' }}>No activity yet</div>
          ) : (
            logs.map((log, i) => (
              <div key={i} style={{ marginBottom: '5px' }}>
                {log}
              </div>
            ))
          )}
        </div>
      </div>

      <div
        style={{
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#fff3cd',
          borderRadius: '5px',
          fontSize: '14px',
        }}
      >
        <strong>Note:</strong> This example uses the <code>asyncRetry</code>{' '}
        utility function, which is a lightweight wrapper that creates a
        retry-enabled version of your async function. For React integration with
        hooks and reactive state, check out the <code>useAsyncRetryer</code>{' '}
        example.
      </div>

      <div
        style={{
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#e3f2fd',
          borderRadius: '5px',
          fontSize: '12px',
        }}
      >
        <strong>Key Differences:</strong>
        <ul style={{ marginTop: '10px', marginBottom: 0 }}>
          <li>
            <code>asyncRetry</code> - Functional utility that wraps an async
            function with retry logic
          </li>
          <li>
            <code>useAsyncRetryer</code> - React hook that provides reactive
            state and lifecycle management
          </li>
          <li>
            <code>AsyncRetryer</code> - Low-level class for advanced use cases
            with fine-grained control
          </li>
        </ul>
      </div>
    </div>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root')!)
root.render(<App />)
