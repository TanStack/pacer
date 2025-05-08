import { useCallback, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { rateLimit } from '@tanstack/react-pacer/rate-limiter'

function App1() {
  // Use your state management library of choice
  const [instantCount, setInstantCount] = useState(0)
  const [rateLimitedCount, setRateLimitedCount] = useState(0)

  // Create rate-limited setter function - Stable reference required!
  const rateLimitedSetCount = useCallback(
    rateLimit(setRateLimitedCount, {
      limit: 5,
      window: 5000,
      // windowType: 'sliding', // default is 'fixed'
      onReject: (rateLimiter) =>
        console.log(
          'Rejected by rate limiter',
          rateLimiter.getMsUntilNextWindow(),
        ),
    }),
    [],
  )

  function increment() {
    // this pattern helps avoid common bugs with stale closures and state
    setInstantCount((c) => {
      const newInstantCount = c + 1 // common new value for both
      rateLimitedSetCount(newInstantCount) // rate-limited state update
      return newInstantCount // instant state update
    })
  }

  return (
    <div>
      <h1>TanStack Pacer rateLimit Example 1</h1>
      <table>
        <tbody>
          <tr>
            <td>Instant Count:</td>
            <td>{instantCount}</td>
          </tr>
          <tr>
            <td>Rate Limited Count:</td>
            <td>{rateLimitedCount}</td>
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
  const [text, setText] = useState('')
  const [rateLimitedText, setRateLimitedText] = useState('')

  // Create rate-limited setter function - Stable reference required!
  const rateLimitedSetText = useCallback(
    rateLimit(setRateLimitedText, {
      limit: 5,
      window: 5000,
      onReject: (rateLimiter) =>
        console.log(
          'Rejected by rate limiter',
          rateLimiter.getMsUntilNextWindow(),
        ),
    }),
    [],
  )

  function handleTextChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newValue = e.target.value
    setText(newValue)
    rateLimitedSetText(newValue)
  }

  return (
    <div>
      <h1>TanStack Pacer rateLimit Example 2</h1>
      <div>
        <input
          autoFocus
          type="search"
          value={text}
          onChange={handleTextChange}
          placeholder="Type text (rate limited to 3 updates per 5 seconds)..."
          style={{ width: '100%' }}
        />
      </div>
      <table>
        <tbody>
          <tr>
            <td>Instant Text:</td>
            <td>{text}</td>
          </tr>
          <tr>
            <td>Rate Limited Text:</td>
            <td>{rateLimitedText}</td>
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
