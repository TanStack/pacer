import { createSignal } from 'solid-js'
import { render } from 'solid-js/web'
import { rateLimit } from '@tanstack/solid-pacer/rate-limiter'

function App1() {
  // Use your state management library of choice
  const [instantCount, setInstantCount] = createSignal(0)
  const [rateLimitedCount, setRateLimitedCount] = createSignal(0)

  // Create rate-limited setter function - Stable reference required!
  const rateLimitedSetCount = rateLimit(setRateLimitedCount, {
    limit: 5,
    window: 5000,
    onReject: (rateLimiter) =>
      console.log(
        'Rejected by rate limiter',
        rateLimiter.getMsUntilNextWindow(),
      ),
  })

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
            <td>{instantCount()}</td>
          </tr>
          <tr>
            <td>Rate Limited Count:</td>
            <td>{rateLimitedCount()}</td>
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
  const [text, setText] = createSignal('')
  const [rateLimitedText, setRateLimitedText] = createSignal('')

  // Create rate-limited setter function - Stable reference required!
  const rateLimitedSetText = rateLimit(setRateLimitedText, {
    limit: 5,
    window: 5000,
    onReject: (rateLimiter) =>
      console.log(
        'Rejected by rate limiter',
        rateLimiter.getMsUntilNextWindow(),
      ),
  })

  function handleTextChange(e: Event) {
    const target = e.target as HTMLInputElement
    const newValue = target.value
    setText(newValue)
    rateLimitedSetText(newValue)
  }

  return (
    <div>
      <h1>TanStack Pacer rateLimit Example 2</h1>
      <div>
        <input
          autofocus
          type="search"
          value={text()}
          onInput={handleTextChange}
          placeholder="Type text (rate limited to 3 updates per 5 seconds)..."
          style={{ width: '100%' }}
        />
      </div>
      <table>
        <tbody>
          <tr>
            <td>Instant Text:</td>
            <td>{text()}</td>
          </tr>
          <tr>
            <td>Rate Limited Text:</td>
            <td>{rateLimitedText()}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

function App3() {
  const [currentValue, setCurrentValue] = createSignal(50)
  const [rateLimitedValue, setRateLimitedValue] = createSignal(50)

  // Create rate-limited setter function - Stable reference required!
  const rateLimitedSetValue = rateLimit(setRateLimitedValue, {
    limit: 20,
    window: 2000,
    // windowType: 'sliding',
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
    rateLimitedSetValue(newValue)
  }

  return (
    <div>
      <h1>TanStack Pacer rateLimit Example 3</h1>
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
            value={rateLimitedValue()}
            readOnly
            style={{ width: '100%' }}
          />
          <span>{rateLimitedValue()}</span>
        </label>
      </div>
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
