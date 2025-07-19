import { useState } from 'react'
import ReactDOM from 'react-dom/client'
import { useRateLimitedState } from '@tanstack/react-pacer/rate-limiter'

function App1() {
  const [windowType, setWindowType] = useState<'fixed' | 'sliding'>('fixed')
  const [instantCount, setInstantCount] = useState(0)

  // Using useRateLimiter with a rate limit of 5 executions per 5 seconds
  const [limitedCount, setLimitedCount, rateLimiter] = useRateLimitedState(
    instantCount,
    {
      // enabled: () => instantCount > 2, // optional, defaults to true
      limit: 5,
      window: 5000,
      windowType: windowType,
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

  function increment() {
    // this pattern helps avoid common bugs with stale closures and state
    setInstantCount((c) => {
      const newInstantCount = c + 1 // common new value for both
      setLimitedCount(newInstantCount) // rate-limited state update
      return newInstantCount // instant state update
    })
  }

  return (
    <div>
      <h1>TanStack Pacer useRateLimitedState Example 1</h1>
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
        <button onClick={() => alert(rateLimiter.getRemainingInWindow())}>
          Remaining in Window
        </button>
        <button onClick={() => alert(rateLimiter.reset())}>Reset</button>
      </div>
      <pre style={{ marginTop: '20px' }}>
        {JSON.stringify(rateLimiter.state, null, 2)}
      </pre>
    </div>
  )
}

function App2() {
  const [windowType, setWindowType] = useState<'fixed' | 'sliding'>('fixed')
  const [instantSearch, setInstantSearch] = useState('')

  // Using useRateLimiter with a rate limit of 5 executions per 5 seconds
  const [limitedSearch, setLimitedSearch, rateLimiter] = useRateLimitedState(
    instantSearch,
    {
      // enabled: instantSearch.length > 2, // optional, defaults to true
      limit: 5,
      window: 5000,
      windowType: windowType,
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
    setLimitedSearch(newValue)
  }

  return (
    <div>
      <h1>TanStack Pacer useRateLimitedState Example 2</h1>
      <div style={{ display: 'grid', gap: '0.5rem', marginBottom: '1rem' }}>
        <label>
          <input
            type="radio"
            name="windowType2"
            value="fixed"
            checked={windowType === 'fixed'}
            onChange={() => setWindowType('fixed')}
          />
          Fixed Window
        </label>
        <label>
          <input
            type="radio"
            name="windowType2"
            value="sliding"
            checked={windowType === 'sliding'}
            onChange={() => setWindowType('sliding')}
          />
          Sliding Window
        </label>
      </div>
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
            <td>Instant Search:</td>
            <td>{instantSearch}</td>
          </tr>
          <tr>
            <td>Rate Limited Search:</td>
            <td>{limitedSearch}</td>
          </tr>
        </tbody>
      </table>
      <div>
        <button onClick={() => alert(rateLimiter.getRemainingInWindow())}>
          Remaining in Window
        </button>
        <button onClick={() => alert(rateLimiter.reset())}>Reset</button>
      </div>
      <pre style={{ marginTop: '20px' }}>
        {JSON.stringify(rateLimiter.state, null, 2)}
      </pre>
    </div>
  )
}

function App3() {
  const [windowType, setWindowType] = useState<'fixed' | 'sliding'>('fixed')
  const [currentValue, setCurrentValue] = useState(50)
  const [instantExecutionCount, setInstantExecutionCount] = useState(0)

  // Using useRateLimitedState with a rate limit of 5 executions per 5 seconds
  const [limitedValue, setLimitedValue, rateLimiter] = useRateLimitedState(
    currentValue,
    {
      limit: 20,
      window: 2000,
      windowType: windowType,
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
    setLimitedValue(newValue)
  }

  return (
    <div>
      <h1>TanStack Pacer useRateLimitedState Example 3</h1>
      <div style={{ display: 'grid', gap: '0.5rem', marginBottom: '1rem' }}>
        <label>
          <input
            type="radio"
            name="windowType3"
            value="fixed"
            checked={windowType === 'fixed'}
            onChange={() => setWindowType('fixed')}
          />
          Fixed Window
        </label>
        <label>
          <input
            type="radio"
            name="windowType3"
            value="sliding"
            checked={windowType === 'sliding'}
            onChange={() => setWindowType('sliding')}
          />
          Sliding Window
        </label>
      </div>
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
        {JSON.stringify(rateLimiter.state, null, 2)}
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
