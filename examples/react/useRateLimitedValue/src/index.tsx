import { useState } from 'react'
import ReactDOM from 'react-dom/client'
import { useRateLimitedValue } from '@tanstack/react-pacer/rate-limiter'

function App1() {
  const [instantCount, setInstantCount] = useState(0)

  // Using useRateLimitedValue with a rate limit of 5 executions per 5 seconds
  // optionally, grab the rate limiter from the last index of the returned array
  const [limitedCount] = useRateLimitedValue(instantCount, {
    // enabled: instantCount > 2, // optional, defaults to true
    limit: 5,
    window: 5000,
    onReject: (rateLimiter) =>
      console.log(
        'Rejected by rate limiter',
        rateLimiter.getMsUntilNextWindow(),
      ),
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
  const [instantSearch, setInstantSearch] = useState('')

  // Using useRateLimitedValue with a rate limit of 5 executions per 5 seconds
  const [limitedSearch] = useRateLimitedValue(instantSearch, {
    // enabled: instantSearch.length > 2, // optional, defaults to true
    limit: 5,
    window: 5000,
    onReject: (rateLimiter) =>
      console.log(
        'Rejected by rate limiter',
        rateLimiter.getMsUntilNextWindow(),
      ),
  })

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInstantSearch(e.target.value)
  }

  return (
    <div>
      <h1>TanStack Pacer useRateLimitedValue Example 2</h1>
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

const root = ReactDOM.createRoot(document.getElementById('root')!)
root.render(
  <div>
    <App1 />
    <hr />
    <App2 />
  </div>,
)
