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
