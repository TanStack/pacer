import { createSignal } from 'solid-js'
import { render } from 'solid-js/web'
import { useRateLimitedValue } from '@tanstack/solid-pacer/rate-limiter'

function App1() {
  const [instantCount, setInstantCount] = createSignal(0)

  // Using useRateLimitedValue with a rate limit of 5 executions per 5 seconds
  const [limitedCount, rateLimiter] = useRateLimitedValue(instantCount, {
    // enabled: instantCount() > 2, // optional, defaults to true
    limit: 5,
    window: 5000,
    onReject: (rejectionInfo) =>
      console.log('Rejected by rate limiter', rejectionInfo),
  })

  function increment() {
    setInstantCount((c) => c + 1)
  }

  return (
    <div>
      <h1>TanStack Pacer useRateLimitedValue Example 1</h1>
      <table>
        <tbody>
          <tr>
            <td>Execution Count:</td>
            <td>{rateLimiter().getExecutionCount()}</td>
          </tr>
          <tr>
            <td>Rejection Count:</td>
            <td>{rateLimiter().getRejectionCount()}</td>
          </tr>
          <tr>
            <td>Instant Count:</td>
            <td>{instantCount()}</td>
          </tr>
          <tr>
            <td>Rate Limited Count:</td>
            <td>{limitedCount()()}</td>
          </tr>
        </tbody>
      </table>
      <div>
        <button onClick={increment}>Increment</button>
        <button onClick={() => alert(rateLimiter().getRemainingInWindow())}>
          Remaining in Window
        </button>
        <button onClick={() => alert(rateLimiter().reset())}>Reset</button>
      </div>
    </div>
  )
}

function App2() {
  const [instantSearch, setInstantSearch] = createSignal('')

  // Using useRateLimitedValue with a rate limit of 5 executions per 5 seconds
  const [limitedSearch, rateLimiter] = useRateLimitedValue(instantSearch, {
    // enabled: instantSearch.length > 2, // optional, defaults to true
    limit: 5,
    window: 5000,
    onReject: (rejectionInfo) =>
      console.log('Rejected by rate limiter', rejectionInfo),
  })

  function handleSearchChange(e: Event) {
    setInstantSearch((e.target as HTMLInputElement).value)
  }

  return (
    <div>
      <h1>TanStack Pacer useRateLimitedValue Example 2</h1>
      <div>
        <input
          type="text"
          value={instantSearch()}
          onChange={handleSearchChange}
          placeholder="Type to search..."
          style={{ width: '100%' }}
        />
      </div>
      <table>
        <tbody>
          <tr>
            <td>Execution Count:</td>
            <td>{rateLimiter().getExecutionCount()}</td>
          </tr>
          <tr>
            <td>Rejection Count:</td>
            <td>{rateLimiter().getRejectionCount()}</td>
          </tr>
          <tr>
            <td>Instant Search:</td>
            <td>{instantSearch()}</td>
          </tr>
          <tr>
            <td>Rate Limited Search:</td>
            <td>{limitedSearch()()}</td>
          </tr>
        </tbody>
      </table>
      <div>
        <button onClick={() => alert(rateLimiter().getRemainingInWindow())}>
          Remaining in Window
        </button>
        <button onClick={() => alert(rateLimiter().reset())}>Reset</button>
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
    </div>
  ),
  document.getElementById('root')!,
)
