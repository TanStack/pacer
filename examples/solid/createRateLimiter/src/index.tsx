import { createSignal } from 'solid-js'
import { render } from 'solid-js/web'
import { createRateLimiter } from '@tanstack/solid-pacer/rate-limiter'

function App1() {
  const [windowType, setWindowType] = createSignal<'fixed' | 'sliding'>('fixed')
  // Use your state management library of choice
  const [instantCount, setInstantCount] = createSignal(0)
  const [limitedCount, setLimitedCount] = createSignal(0)

  // Using createRateLimiter with a rate limit of 5 executions per 5 seconds
  const rateLimiter = createRateLimiter(
    setLimitedCount,
    {
      limit: 5,
      window: 5000,
      windowType: windowType(),
      onReject: (rateLimiter) =>
        console.log(
          'Rejected by rate limiter',
          rateLimiter.getMsUntilNextWindow(),
        ),
    },
    // Alternative to rateLimiter.Subscribe: pass a selector as 3rd arg to track state and subscribe to updates
    // (state) => state,
  )

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
      <h1>TanStack Pacer createRateLimiter Example 1</h1>
      <div style={{ display: 'grid', gap: '0.5rem', 'margin-bottom': '1rem' }}>
        <label>
          <input
            type="radio"
            name="windowType"
            value="fixed"
            checked={windowType() === 'fixed'}
            onChange={() => setWindowType('fixed')}
          />
          Fixed Window
        </label>
        <label>
          <input
            type="radio"
            name="windowType"
            value="sliding"
            checked={windowType() === 'sliding'}
            onChange={() => setWindowType('sliding')}
          />
          Sliding Window
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
            {(state) => (
              <>
                <tr>
                  <td>Execution Count:</td>
                  <td>{state().executionCount}</td>
                </tr>
                <tr>
                  <td>Rejection Count:</td>
                  <td>{state().rejectionCount}</td>
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
                  <td>{instantCount()}</td>
                </tr>
                <tr>
                  <td>Rate Limited Count:</td>
                  <td>{limitedCount()}</td>
                </tr>
              </>
            )}
          </rateLimiter.Subscribe>
        </tbody>
      </table>
      <div>
        <button onClick={increment}>Increment</button>
        <button onClick={() => rateLimiter.reset()}>Reset</button>
      </div>
      <rateLimiter.Subscribe selector={(state) => state}>
        {(state) => (
          <pre style={{ 'margin-top': '20px' }}>
            {JSON.stringify(state, null, 2)}
          </pre>
        )}
      </rateLimiter.Subscribe>
    </div>
  )
}

function App2() {
  const [windowType, setWindowType] = createSignal<'fixed' | 'sliding'>('fixed')
  const [instantSearch, setInstantSearch] = createSignal('')
  const [limitedSearch, setLimitedSearch] = createSignal('')

  // Using createRateLimiter with a rate limit of 5 executions per 5 seconds
  const rateLimiter = createRateLimiter(
    setLimitedSearch,
    {
      enabled: instantSearch().length > 2, // optional, defaults to true
      limit: 5,
      window: 5000,
      windowType: windowType(),
      onReject: (rateLimiter) =>
        console.log(
          'Rejected by rate limiter',
          rateLimiter.getMsUntilNextWindow(),
        ),
    },
    // Alternative to rateLimiter.Subscribe: pass a selector as 3rd arg to track state and subscribe to updates
    // (state) => state,
  )

  function handleSearchChange(e: Event) {
    const target = e.target as HTMLInputElement
    const newValue = target.value
    setInstantSearch(newValue)
    rateLimiter.maybeExecute(newValue)
  }

  return (
    <div>
      <h1>TanStack Pacer createRateLimiter Example 2</h1>
      <div style={{ display: 'grid', gap: '0.5rem', 'margin-bottom': '1rem' }}>
        <label>
          <input
            type="radio"
            name="windowType2"
            value="fixed"
            checked={windowType() === 'fixed'}
            onChange={() => setWindowType('fixed')}
          />
          Fixed Window
        </label>
        <label>
          <input
            type="radio"
            name="windowType2"
            value="sliding"
            checked={windowType() === 'sliding'}
            onChange={() => setWindowType('sliding')}
          />
          Sliding Window
        </label>
      </div>
      <div>
        <input
          autofocus
          type="search"
          value={instantSearch()}
          onInput={handleSearchChange}
          placeholder="Type to search..."
          style={{ width: '100%' }}
        />
      </div>
      <table>
        <tbody>
          <rateLimiter.Subscribe
            selector={(state) => ({
              executionCount: state.executionCount,
              rejectionCount: state.rejectionCount,
            })}
          >
            {(state) => (
              <>
                <tr>
                  <td>Execution Count:</td>
                  <td>{state().executionCount}</td>
                </tr>
                <tr>
                  <td>Rejection Count:</td>
                  <td>{state().rejectionCount}</td>
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
                  <td>{limitedSearch()}</td>
                </tr>
              </>
            )}
          </rateLimiter.Subscribe>
        </tbody>
      </table>
      <div>
        <button onClick={() => rateLimiter.reset()}>Reset</button>
      </div>
      <rateLimiter.Subscribe selector={(state) => state}>
        {(state) => (
          <pre style={{ 'margin-top': '20px' }}>
            {JSON.stringify(state, null, 2)}
          </pre>
        )}
      </rateLimiter.Subscribe>
    </div>
  )
}

function App3() {
  const [windowType, setWindowType] = createSignal<'fixed' | 'sliding'>('fixed')
  const [currentValue, setCurrentValue] = createSignal(50)
  const [limitedValue, setLimitedValue] = createSignal(50)
  const [instantExecutionCount, setInstantExecutionCount] = createSignal(0)

  // Using createRateLimiter with a rate limit of 5 executions per 5 seconds
  const rateLimiter = createRateLimiter(
    setLimitedValue,
    {
      limit: 20,
      window: 2000,
      windowType: windowType(),
      onReject: (rateLimiter) =>
        console.log(
          'Rejected by rate limiter',
          rateLimiter.getMsUntilNextWindow(),
        ),
    },
    // Alternative to rateLimiter.Subscribe: pass a selector as 3rd arg to track state and subscribe to updates
    // (state) => state,
  )

  function handleRangeChange(e: Event) {
    const target = e.target as HTMLInputElement
    const newValue = parseInt(target.value, 10)
    setCurrentValue(newValue)
    setInstantExecutionCount((c) => c + 1)
    rateLimiter.maybeExecute(newValue)
  }

  return (
    <div>
      <h1>TanStack Pacer createRateLimiter Example 3</h1>
      <div style={{ display: 'grid', gap: '0.5rem', 'margin-bottom': '1rem' }}>
        <label>
          <input
            type="radio"
            name="windowType3"
            value="fixed"
            checked={windowType() === 'fixed'}
            onChange={() => setWindowType('fixed')}
          />
          Fixed Window
        </label>
        <label>
          <input
            type="radio"
            name="windowType3"
            value="sliding"
            checked={windowType() === 'sliding'}
            onChange={() => setWindowType('sliding')}
          />
          Sliding Window
        </label>
      </div>
      <div style={{ 'margin-bottom': '20px' }}>
        <label>
          Current Range:
          <input
            type="range"
            min="0"
            max="100"
            value={currentValue()}
            onInput={handleRangeChange}
            style={{ width: '100%' }}
          />
          <span>{currentValue()}</span>
        </label>
      </div>
      <div style={{ 'margin-bottom': '20px' }}>
        <label>
          Rate Limited Range (Readonly):
          <input
            type="range"
            min="0"
            max="100"
            value={limitedValue()}
            readOnly
            style={{ width: '100%' }}
          />
          <span>{limitedValue()}</span>
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
            {(state) => (
              <>
                <tr>
                  <td>Execution Count:</td>
                  <td>{state().executionCount}</td>
                </tr>
                <tr>
                  <td>Rejection Count:</td>
                  <td>{state().rejectionCount}</td>
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
                  <td>{instantExecutionCount()}</td>
                </tr>
                <tr>
                  <td>Saved Executions:</td>
                  <td>{instantExecutionCount() - state().executionCount}</td>
                </tr>
                <tr>
                  <td>% Reduction:</td>
                  <td>
                    {instantExecutionCount() === 0
                      ? '0'
                      : Math.round(
                          ((instantExecutionCount() - state().executionCount) /
                            instantExecutionCount()) *
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
      <div style={{ color: '#666', 'font-size': '0.9em' }}>
        <p>Rate limited to 20 updates per 2 seconds</p>
      </div>
      <rateLimiter.Subscribe selector={(state) => state}>
        {(state) => (
          <pre style={{ 'margin-top': '20px' }}>
            {JSON.stringify(state, null, 2)}
          </pre>
        )}
      </rateLimiter.Subscribe>
    </div>
  )
}

render(
  () => (
    <div>
      <App1 />
      <hr />
      <App2 />
      <hr />
      <App3 />
    </div>
  ),
  document.getElementById('root')!,
)
