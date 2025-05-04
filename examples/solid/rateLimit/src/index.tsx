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
