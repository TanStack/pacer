import { createSignal } from 'solid-js'
import { render } from 'solid-js/web'
import { createThrottledValue } from '@tanstack/solid-pacer/throttler'

function App1() {
  const [instantCount, setInstantCount] = createSignal(0)

  function increment() {
    setInstantCount((c) => c + 1)
  }

  // highest-level hook that watches an instant local state value and returns a throttled value
  // optionally, grab the throttler from the last index of the returned array
  const [throttledCount] = createThrottledValue(instantCount, {
    wait: 1000,
  })

  return (
    <div>
      <h1>TanStack Pacer createThrottledValue Example 1</h1>
      <table>
        <tbody>
          <tr>
            <td>Instant Count:</td>
            <td>{instantCount()}</td>
          </tr>
          <tr>
            <td>Throttled Count:</td>
            <td>{throttledCount()}</td>
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

  // highest-level hook that watches an instant local state value and returns a throttled value
  const [throttledSearch] = createThrottledValue(instantSearch, {
    wait: 1000,
  })

  function handleSearchChange(e: Event) {
    setInstantSearch((e.target as HTMLInputElement).value)
  }

  return (
    <div>
      <h1>TanStack Pacer createThrottledValue Example 2</h1>
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
            <td>Throttled Search:</td>
            <td>{throttledSearch()}</td>
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
