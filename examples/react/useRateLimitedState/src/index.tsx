import { useState } from 'react'
import ReactDOM from 'react-dom/client'
import { useRateLimitedState } from '@tanstack/react-pacer/rate-limiter'

function App1() {
  const [instantCount, setInstantCount] = useState(0)

  // Using useRateLimiter with a rate limit of 5 executions per 5 seconds
  const [limitedCount, setLimitedCount, rateLimiter] = useRateLimitedState(
    instantCount,
    {
      // enabled: instantCount > 2, // optional, defaults to true
      limit: 5,
      window: 5000,
      onReject: (rateLimiter) =>
        console.log(
          'Rejected by rate limiter',
          rateLimiter.getMsUntilNextWindow(),
        ),
    },
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
      <table>
        <tbody>
          <tr>
            <td>Execution Count:</td>
            <td>{rateLimiter.getExecutionCount()}</td>
          </tr>
          <tr>
            <td>Rejection Count:</td>
            <td>{rateLimiter.getRejectionCount()}</td>
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
    </div>
  )
}

function App2() {
  const [instantSearch, setInstantSearch] = useState('')

  // Using useRateLimiter with a rate limit of 5 executions per 5 seconds
  const [limitedSearch, setLimitedSearch, rateLimiter] = useRateLimitedState(
    instantSearch,
    {
      // enabled: instantSearch.length > 2, // optional, defaults to true
      limit: 5,
      window: 5000,
      onReject: (rateLimiter) =>
        console.log(
          'Rejected by rate limiter',
          rateLimiter.getMsUntilNextWindow(),
        ),
    },
  )

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newValue = e.target.value
    setInstantSearch(newValue)
    setLimitedSearch(newValue)
  }

  return (
    <div>
      <h1>TanStack Pacer useRateLimitedState Example 2</h1>
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
            <td>{rateLimiter.getExecutionCount()}</td>
          </tr>
          <tr>
            <td>Rejection Count:</td>
            <td>{rateLimiter.getRejectionCount()}</td>
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
    </div>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root')!)
root.render(
  <div>
    <App1 />
    <hr />
    <App2 />
  </div>,
)
