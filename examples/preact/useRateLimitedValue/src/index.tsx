import { useState } from 'preact/hooks'
import { render } from 'preact'
import type { JSX } from 'preact'
import { useRateLimitedValue } from '@tanstack/preact-pacer/rate-limiter'

function App1() {
  const [windowType, setWindowType] = useState<'fixed' | 'sliding'>('fixed')
  const [instantCount, setInstantCount] = useState(0)

  // Using useRateLimitedValue with a rate limit of 5 executions per 5 seconds
  // optionally, grab the rate limiter from the last index of the returned array
  const [limitedCount] = useRateLimitedValue(instantCount, {
    // enabled: () => instantCount > 2, // optional, defaults to true
    limit: 5,
    window: 5000,
    windowType: windowType,
    onReject: (rateLimiter) =>
      console.log(
        'Rejected by rate limiter',
        rateLimiter.getMsUntilNextWindow(),
      ),
    // Alternative to rateLimiter.Subscribe: pass a selector as 3rd arg to cause re-renders and subscribe to state
    // (state) => state,
  })

  function increment() {
    setInstantCount((c) => c + 1)
  }

  return (
    <div>
      <h1>TanStack Pacer useRateLimitedValue Example 1</h1>
      <div style={{ display: 'grid', gap: '0.5rem', marginBottom: '1rem' }}>
        <label>
          <input
            type="radio"
            name="windowType"
            value="fixed"
            checked={windowType === 'fixed'}
            onInput={() => setWindowType('fixed')}
          />
          Fixed Window
        </label>
        <label>
          <input
            type="radio"
            name="windowType"
            value="sliding"
            checked={windowType === 'sliding'}
            onInput={() => setWindowType('sliding')}
          />
          Sliding Window
        </label>
      </div>
      <table>
        <tbody>
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
      </div>
    </div>
  )
}

function App2() {
  const [windowType, setWindowType] = useState<'fixed' | 'sliding'>('fixed')
  const [instantSearch, setInstantSearch] = useState('')

  // Using useRateLimitedValue with a rate limit of 5 executions per 5 seconds
  const [limitedSearch] = useRateLimitedValue(instantSearch, {
    // enabled: instantSearch.length > 2, // optional, defaults to true
    limit: 5,
    window: 5000,
    windowType: windowType,
    onReject: (rateLimiter) =>
      console.log(
        'Rejected by rate limiter',
        rateLimiter.getMsUntilNextWindow(),
      ),
    // Alternative to rateLimiter.Subscribe: pass a selector as 3rd arg to cause re-renders and subscribe to state
    // (state) => state,
  })

  function handleSearchChange(e: JSX.TargetedEvent<HTMLInputElement>) {
    setInstantSearch(e.currentTarget.value)
  }

  return (
    <div>
      <h1>TanStack Pacer useRateLimitedValue Example 2</h1>
      <div style={{ display: 'grid', gap: '0.5rem', marginBottom: '1rem' }}>
        <label>
          <input
            type="radio"
            name="windowType2"
            value="fixed"
            checked={windowType === 'fixed'}
            onInput={() => setWindowType('fixed')}
          />
          Fixed Window
        </label>
        <label>
          <input
            type="radio"
            name="windowType2"
            value="sliding"
            checked={windowType === 'sliding'}
            onInput={() => setWindowType('sliding')}
          />
          Sliding Window
        </label>
      </div>
      <div>
        <input
          autoFocus
          type="search"
          value={instantSearch}
          onInput={handleSearchChange}
          placeholder="Type to search..."
          style={{ width: '100%' }}
        />
      </div>
      <table>
        <tbody>
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
    </div>
  )
}

function App3() {
  const [windowType, setWindowType] = useState<'fixed' | 'sliding'>('fixed')
  const [currentValue, setCurrentValue] = useState(50)
  const [instantExecutionCount, setInstantExecutionCount] = useState(0)

  // Using useRateLimitedValue with a rate limit of 5 executions per 5 seconds
  const [limitedValue, rateLimiter] = useRateLimitedValue(currentValue, {
    limit: 20,
    window: 2000,
    windowType: windowType,
    onReject: (rateLimiter) =>
      console.log(
        'Rejected by rate limiter',
        rateLimiter.getMsUntilNextWindow(),
      ),
    // Alternative to rateLimiter.Subscribe: pass a selector as 3rd arg to cause re-renders and subscribe to state
    // (state) => state,
  })

  function handleRangeChange(e: JSX.TargetedEvent<HTMLInputElement>) {
    const newValue = parseInt(e.currentTarget.value, 10)
    setCurrentValue(newValue)
    setInstantExecutionCount((c) => c + 1)
  }

  return (
    <div>
      <h1>TanStack Pacer useRateLimitedValue Example 3</h1>
      <div style={{ display: 'grid', gap: '0.5rem', marginBottom: '1rem' }}>
        <label>
          <input
            type="radio"
            name="windowType3"
            value="fixed"
            checked={windowType === 'fixed'}
            onInput={() => setWindowType('fixed')}
          />
          Fixed Window
        </label>
        <label>
          <input
            type="radio"
            name="windowType3"
            value="sliding"
            checked={windowType === 'sliding'}
            onInput={() => setWindowType('sliding')}
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
            onInput={handleRangeChange}
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
          <rateLimiter.Subscribe
            selector={(state) => ({
              executionCount: state.executionCount,
              rejectionCount: state.rejectionCount,
            })}
          >
            {({ executionCount, rejectionCount }) => (
              <>
                <tr>
                  <td>Execution Count:</td>
                  <td>{executionCount}</td>
                </tr>
                <tr>
                  <td>Rejection Count:</td>
                  <td>{rejectionCount}</td>
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
                  <td>{instantExecutionCount - executionCount}</td>
                </tr>
                <tr>
                  <td>% Reduction:</td>
                  <td>
                    {instantExecutionCount === 0
                      ? '0'
                      : Math.round(
                          ((instantExecutionCount - executionCount) /
                            instantExecutionCount) *
                            100,
                        )}
                    %
                  </td>
                </tr>
              </>
            )}
          </rateLimiter.Subscribe>
        </tbody>
      </table>
      <div style={{ color: '#666', fontSize: '0.9em' }}>
        <p>Rate limited to 20 updates per 2 seconds</p>
      </div>
      <rateLimiter.Subscribe selector={(state) => state}>
        {(state) => (
          <pre style={{ marginTop: '20px' }}>
            {JSON.stringify(state, null, 2)}
          </pre>
        )}
      </rateLimiter.Subscribe>
    </div>
  )
}

const root = document.getElementById('root')!
render(
  <div>
    <App1 />
    <hr />
    <App2 />
    <hr />
    <App3 />
  </div>,
  root,
)
