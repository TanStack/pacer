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

function App3() {
  const [currentValue, setCurrentValue] = useState(50)
  const [rateLimitedValue, setRateLimitedValue] = useState(50)

  // Create rate-limited setter function - Stable reference required!
  const rateLimitedSetValue = useCallback(
    rateLimit(setRateLimitedValue, {
      limit: 30,
      window: 2000,
      onReject: (rateLimiter) =>
        console.log(
          'Rejected by rate limiter',
          rateLimiter.getMsUntilNextWindow(),
        ),
    }),
    [],
  )

  function handleRangeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newValue = parseInt(e.target.value, 10)
    setCurrentValue(newValue)
    rateLimitedSetValue(newValue)
  }

  return (
    <div>
      <h1>TanStack Pacer rateLimit Example 3</h1>
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
            value={rateLimitedValue}
            readOnly
            style={{ width: '100%' }}
          />
          <span>{rateLimitedValue}</span>
        </label>
      </div>
      <div style={{ color: '#666', fontSize: '0.9em' }}>
        <p>Rate limited to 30 updates per 2000ms window</p>
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
    <hr />
    <App3 />
  </div>,
)
