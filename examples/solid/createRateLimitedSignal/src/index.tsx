import { createSignal } from 'solid-js'
import { render } from 'solid-js/web'
import { createRateLimitedSignal } from '@tanstack/solid-pacer/rate-limiter'

function App1() {
  const [instantCount, setInstantCount] = createSignal(0)
  const [rejectionCount, setRejectionCount] = createSignal(0)
  const [executionCount, setExecutionCount] = createSignal(0)

  // Using createRateLimiter with a rate limit of 5 executions per 5 seconds
  const [limitedCount, setLimitedCount, rateLimiter] = createRateLimitedSignal(
    instantCount,
    {
      limit: 5,
      window: 5000,
      onExecute: () => {
        setExecutionCount(rateLimiter.getExecutionCount())
      },
      onReject: () => {
          setRejectionCount(rateLimiter.getRejectionCount())
      },
    },
  )

  function increment() {
    // this pattern helps avoid common bugs with stale closures and state
    setInstantCount((c) => {
      const newInstantCount = c + 1 // common new value for both
      setLimitedCount(() => () => newInstantCount) // rate-limited state update
      return newInstantCount // instant state update
    })
  }

  return (
    <div>
      <h1>TanStack Pacer createRateLimitedState Example 1</h1>
      <table>
        <tbody>
          <tr>
            <td>Execution Count:</td>
            <td>{executionCount()}</td>
          </tr>
          <tr>
            <td>Rejection Count:</td>
            <td>{rejectionCount()}</td>
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
        <button onClick={() => alert(rateLimiter.getRemainingInWindow())}>
          Remaining in Window
        </button>
        <button onClick={() => alert(rateLimiter.reset())}>Reset</button>
      </div>
    </div>
  )
}

function App2() {
  const [instantSearch, setInstantSearch] = createSignal('')
  const [rejectionCount, setRejectionCount] = createSignal(0)
  const [executionCount, setExecutionCount] = createSignal(0)

  // Using createRateLimiter with a rate limit of 5 executions per 5 seconds
  const [limitedSearch, setLimitedSearch, rateLimiter] =
    createRateLimitedSignal(instantSearch, {
      // enabled: instantSearch.length > 2, // optional, defaults to true
      limit: 5,
      window: 5000,
      onExecute: () => {
        setExecutionCount(rateLimiter.getExecutionCount())
      },
      onReject: () => {
          setRejectionCount(rateLimiter.getRejectionCount())
      },
    })

  function handleSearchChange(e: Event) {
    const target = e.target as HTMLInputElement
    const newValue = target.value
    setInstantSearch(() => newValue)
    setLimitedSearch(() => () => newValue)
  }

  return (
    <div>
      <h1>TanStack Pacer createRateLimitedState Example 2</h1>
      <div>
        <input
          type="text"
          value={instantSearch()}
          onInput={handleSearchChange}
          placeholder="Type to search..."
          style={{ width: '100%' }}
        />
      </div>
      <table>
        <tbody>
          <tr>
            <td>Execution Count:</td>
            <td>{executionCount()}</td>
          </tr>
          <tr>
            <td>Rejection Count:</td>
            <td>{rejectionCount()}</td>
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
        <button onClick={() => alert(rateLimiter.getRemainingInWindow())}>
          Remaining in Window
        </button>
        <button onClick={() => alert(rateLimiter.reset())}>Reset</button>
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
