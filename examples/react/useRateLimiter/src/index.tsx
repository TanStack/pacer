import { useState } from 'react'
import ReactDOM from 'react-dom/client'
import { useRateLimiter } from '@tanstack/react-pacer/rate-limiter'

function App1() {
  // Use your state management library of choice
  const [instantCount, setInstantCount] = useState(0)
  const [limitedCount, setLimitedCount] = useState(0)

  // Using useRateLimiter with a rate limit of 5 executions per 5 seconds
  const rateLimiter = useRateLimiter(setLimitedCount, {
    // enabled: instantCount > 2,
    limit: 5,
    window: 5000,
    // windowType: 'sliding', // default is 'fixed'
    onReject: (rateLimiter) =>
      console.log(
        'Rejected by rate limiter',
        rateLimiter.getMsUntilNextWindow(),
      ),
  })

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
      <h1>TanStack Pacer useRateLimiter Example 1</h1>
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
    </div>
  )
}

function App2() {
  const [instantSearch, setInstantSearch] = useState('')
  const [limitedSearch, setLimitedSearch] = useState('')

  // Using useRateLimiter with a rate limit of 5 executions per 5 seconds
  const rateLimiter = useRateLimiter(setLimitedSearch, {
    enabled: instantSearch.length > 2, // optional, defaults to true
    limit: 5,
    window: 5000,
    // windowType: 'sliding', // default is 'fixed'
    onReject: (rateLimiter) =>
      console.log(
        'Rejected by rate limiter',
        rateLimiter.getMsUntilNextWindow(),
      ),
  })

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
            <td>{rateLimiter.getExecutionCount()}</td>
          </tr>
          <tr>
            <td>Rejection Count:</td>
            <td>{rateLimiter.getRejectionCount()}</td>
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
