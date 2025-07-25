import { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { useRateLimiter } from '@tanstack/react-pacer/rate-limiter'
import { useStoragePersister } from '@tanstack/react-persister/storage-persister'
import type { RateLimiterState } from '@tanstack/react-pacer/rate-limiter'

function App1() {
  const [windowType, setWindowType] = useState<'fixed' | 'sliding'>('fixed')

  // Use your state management library of choice
  const [instantCount, setInstantCount] = useState(0) // not rate-limited
  const [limitedCount, setLimitedCount] = useState(0) // rate-limited

  const rateLimiterPersister = useStoragePersister<RateLimiterState>({
    key: 'my-rate-limiter',
    storage: localStorage,
    maxAge: 1000 * 60, // 1 minute
    buster: 'v1',
  })

  // Using useRateLimiter with a rate limit of 5 executions per 5 seconds
  const rateLimiter = useRateLimiter(
    setLimitedCount,
    {
      // enabled: () => instantCount > 2,
      limit: 5,
      window: 5000,
      windowType: windowType,
      onReject: (rateLimiter) =>
        console.log(
          'Rejected by rate limiter',
          rateLimiter.getMsUntilNextWindow(),
        ),
      // optional local storage persister to retain state on page refresh
      initialState: rateLimiterPersister.loadState(),
    },
    // Optional Selector function to pick the state you want to track and use
    (state) => state, // entire state subscription for persister - don't do this unless you need to
  )

  useEffect(() => {
    rateLimiterPersister.saveState(rateLimiter.state)
  }, [rateLimiter.state])

  function increment() {
    // this pattern helps avoid common bugs with stale closures and state
    setInstantCount((c) => {
      const newCount = c + 1 // common new value for both
      rateLimiter.maybeExecute(newCount) // rate-limited state update
      return newCount // instant state update
    })
  }

  return (
    <div>
      <h1>TanStack Pacer useRateLimiter Example 1 (with persister)</h1>
      <div style={{ display: 'grid', gap: '0.5rem', marginBottom: '1rem' }}>
        <label>
          <input
            type="radio"
            name="windowType"
            value="fixed"
            checked={windowType === 'fixed'}
            onChange={() => setWindowType('fixed')}
          />
          Fixed Window
        </label>
        <label>
          <input
            type="radio"
            name="windowType"
            value="sliding"
            checked={windowType === 'sliding'}
            onChange={() => setWindowType('sliding')}
          />
          Sliding Window
        </label>
      </div>
      <table>
        <tbody>
          <tr>
            <td>Execution Count:</td>
            <td>{rateLimiter.state.executionCount}</td>
          </tr>
          <tr>
            <td>Rejection Count:</td>
            <td>{rateLimiter.state.rejectionCount}</td>
          </tr>
          <tr>
            <td>Remaining in Window:</td>
            <td>{rateLimiter.getRemainingInWindow()}</td>
          </tr>
          <tr>
            <td>Ms Until Next Window:</td>
            <td>{rateLimiter.getMsUntilNextWindow()}</td>
          </tr>
          <tr>
            <td colSpan={2}>
              <hr />
            </td>
          </tr>
          <tr>
            <td>Instant Count:</td>
            <td>{instantCount}</td>
          </tr>
          <tr>
            <td>Rate Limited Count:</td>
            <td>{limitedCount}</td>
          </tr>
        </tbody>
      </table>
      <div>
        <button onClick={increment}>Increment</button>
        <button onClick={() => rateLimiter.reset()}>Reset</button>
      </div>
      <pre style={{ marginTop: '20px' }}>
        {JSON.stringify(rateLimiter.store.state, null, 2)}
      </pre>
    </div>
  )
}

function App2() {
  const [instantSearch, setInstantSearch] = useState('')
  const [limitedSearch, setLimitedSearch] = useState('')

  // Using useRateLimiter with a rate limit of 5 executions per 5 seconds
  const rateLimiter = useRateLimiter(
    setLimitedSearch,
    {
      enabled: instantSearch.length > 2, // optional, defaults to true
      limit: 5,
      window: 5000,
      // windowType: 'sliding', // default is 'fixed'
      onReject: (rateLimiter) =>
        console.log(
          'Rejected by rate limiter',
          rateLimiter.getMsUntilNextWindow(),
        ),
    },
    // Optional Selector function to pick the state you want to track and use
    (state) => ({
      executionCount: state.executionCount,
      rejectionCount: state.rejectionCount,
    }),
  )

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newValue = e.target.value
    setInstantSearch(newValue)
    rateLimiter.maybeExecute(newValue)
  }

  return (
    <div>
      <h1>TanStack Pacer useRateLimiter Example 2</h1>
      <div>
        <input
          autoFocus
          type="search"
          value={instantSearch}
          onChange={handleSearchChange}
          placeholder="Type to search..."
          style={{ width: '100%' }}
        />
      </div>
      <table>
        <tbody>
          <tr>
            <td>Execution Count:</td>
            <td>{rateLimiter.state.executionCount}</td>
          </tr>
          <tr>
            <td>Rejection Count:</td>
            <td>{rateLimiter.state.rejectionCount}</td>
          </tr>
          <tr>
            <td>Remaining in Window:</td>
            <td>{rateLimiter.getRemainingInWindow()}</td>
          </tr>
          <tr>
            <td>Ms Until Next Window:</td>
            <td>{rateLimiter.getMsUntilNextWindow()}</td>
          </tr>
          <tr>
            <td colSpan={2}>
              <hr />
            </td>
          </tr>
          <tr>
            <td>Instant Search:</td>
          </tr>
          <tr>
            <td>Rate Limited Search:</td>
            <td>{limitedSearch}</td>
          </tr>
        </tbody>
      </table>
      <div>
        <button onClick={() => rateLimiter.reset()}>Reset</button>
      </div>
      <pre style={{ marginTop: '20px' }}>
        {JSON.stringify(rateLimiter.store.state, null, 2)}
      </pre>
    </div>
  )
}

function App3() {
  const [currentValue, setCurrentValue] = useState(50)
  const [limitedValue, setLimitedValue] = useState(50)
  const [instantExecutionCount, setInstantExecutionCount] = useState(0)

  // Using useRateLimiter with a rate limit of 5 executions per 5 seconds
  const rateLimiter = useRateLimiter(
    setLimitedValue,
    {
      limit: 20,
      window: 2000,
      onReject: (rateLimiter) =>
        console.log(
          'Rejected by rate limiter',
          rateLimiter.getMsUntilNextWindow(),
        ),
    },
    // Optional Selector function to pick the state you want to track and use
    (state) => ({
      executionCount: state.executionCount,
      rejectionCount: state.rejectionCount,
    }),
  )

  function handleRangeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newValue = parseInt(e.target.value, 10)
    setCurrentValue(newValue)
    setInstantExecutionCount((c) => c + 1)
    rateLimiter.maybeExecute(newValue)
  }

  return (
    <div>
      <h1>TanStack Pacer useRateLimiter Example 3</h1>
      <div style={{ marginBottom: '20px' }}>
        <label>
          Current Range:
          <input
            type="range"
            min="0"
            max="100"
            value={currentValue}
            onChange={handleRangeChange}
            style={{ width: '100%' }}
          />
          <span>{currentValue}</span>
        </label>
      </div>
      <div style={{ marginBottom: '20px' }}>
        <label>
          Rate Limited Range (Readonly):
          <input
            type="range"
            min="0"
            max="100"
            value={limitedValue}
            readOnly
            style={{ width: '100%' }}
          />
          <span>{limitedValue}</span>
        </label>
      </div>
      <table>
        <tbody>
          <tr>
            <td>Execution Count:</td>
            <td>{rateLimiter.state.executionCount}</td>
          </tr>
          <tr>
            <td>Rejection Count:</td>
            <td>{rateLimiter.state.rejectionCount}</td>
          </tr>
          <tr>
            <td>Remaining in Window:</td>
            <td>{rateLimiter.getRemainingInWindow()}</td>
          </tr>
          <tr>
            <td>Ms Until Next Window:</td>
            <td>{rateLimiter.getMsUntilNextWindow()}</td>
          </tr>
          <tr>
            <td>Instant Executions:</td>
            <td>{instantExecutionCount}</td>
          </tr>
          <tr>
            <td>Saved Executions:</td>
            <td>{instantExecutionCount - rateLimiter.state.executionCount}</td>
          </tr>
          <tr>
            <td>% Reduction:</td>
            <td>
              {instantExecutionCount === 0
                ? '0'
                : Math.round(
                    ((instantExecutionCount -
                      rateLimiter.state.executionCount) /
                      instantExecutionCount) *
                      100,
                  )}
              %
            </td>
          </tr>
        </tbody>
      </table>
      <div style={{ color: '#666', fontSize: '0.9em' }}>
        <p>Rate limited to 20 updates per 2 seconds</p>
      </div>
      <pre style={{ marginTop: '20px' }}>
        {JSON.stringify(rateLimiter.store.state, null, 2)}
      </pre>
    </div>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root')!)
root.render(
  <div>
    <App1 />
    <hr />
    <App2 />
    <hr />
    <App3 />
  </div>,
)
