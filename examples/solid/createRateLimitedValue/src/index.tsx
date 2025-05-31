import { createSignal } from 'solid-js'
import { render } from 'solid-js/web'
import { createRateLimitedValue } from '@tanstack/solid-pacer/rate-limiter'

function App1() {
  const [instantCount, setInstantCount] = createSignal(0)

  // Using createRateLimitedValue with a rate limit of 5 executions per 5 seconds
  const [limitedCount] = createRateLimitedValue(instantCount, {
    limit: 5,
    window: 5000,
  })

  function increment() {
    setInstantCount((c) => c + 1)
  }

  return (
    <div>
      <h1>TanStack Pacer createRateLimitedValue Example 1</h1>
      <table>
        <tbody>
          <tr>
            <td>Instant Count:</td>
            <td>{instantCount()}</td>
          </tr>
          <tr>
            <td>Rate Limited Count:</td>
            <td>{limitedCount()}</td>
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
  const [instantSearch, setInstantSearch] = createSignal('')

  // Using createRateLimitedValue with a rate limit of 5 executions per 5 seconds
  const [limitedSearch] = createRateLimitedValue(instantSearch, {
    limit: 5,
    window: 5000,
  })

  function handleSearchChange(e: Event) {
    setInstantSearch((e.target as HTMLInputElement).value)
  }

  return (
    <div>
      <h1>TanStack Pacer createRateLimitedValue Example 2</h1>
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
          <tr>
            <td>Instant Search:</td>
            <td>{instantSearch()}</td>
          </tr>
          <tr>
            <td>Rate Limited Search:</td>
            <td>{limitedSearch()}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

function App3() {
  const [currentValue, setCurrentValue] = createSignal(50)
  const [instantExecutionCount, setInstantExecutionCount] = createSignal(0)

  // Using createRateLimitedValue with a rate limit of 5 executions per 5 seconds
  const [limitedValue, rateLimiter] = createRateLimitedValue(currentValue, {
    limit: 20,
    window: 2000,
    windowType: 'sliding',
    onReject: (rateLimiter) =>
      console.log(
        'Rejected by rate limiter',
        rateLimiter.getMsUntilNextWindow(),
      ),
  })

  function handleRangeChange(e: Event) {
    const target = e.target as HTMLInputElement
    const newValue = parseInt(target.value, 10)
    setCurrentValue(newValue)
    setInstantExecutionCount((c) => c + 1)
  }

  return (
    <div>
      <h1>TanStack Pacer createRateLimitedValue Example 3</h1>
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
          <tr>
            <td>Instant Executions:</td>
            <td>{instantExecutionCount()}</td>
          </tr>
          <tr>
            <td>Rate Limited Executions:</td>
            <td>{rateLimiter.executionCount()}</td>
          </tr>
          <tr>
            <td>Rejected Executions:</td>
            <td>{rateLimiter.rejectionCount()}</td>
          </tr>
          <tr>
            <td>% Reduction:</td>
            <td>
              {instantExecutionCount() === 0
                ? '0'
                : Math.round(
                    ((instantExecutionCount() - rateLimiter.executionCount()) /
                      instantExecutionCount()) *
                      100,
                  )}
              %
            </td>
          </tr>
        </tbody>
      </table>
      <div style={{ color: '#666', 'font-size': '0.9em' }}>
        <p>Rate limited to 20 updates per 2 seconds</p>
      </div>
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
