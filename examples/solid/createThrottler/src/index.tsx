import { createEffect, createSignal } from 'solid-js'
import { render } from 'solid-js/web'
import { createThrottler } from '@tanstack/solid-pacer/throttler'

function App1() {
  // Use your state management library of choice
  const [instantCount, setInstantCount] = createSignal(0)
  const [throttledCount, setThrottledCount] = createSignal(0)

  // Lower-level createThrottler hook - requires you to manage your own state
  const setCountThrottler = createThrottler(setThrottledCount, {
    wait: 1000,
  })

  // enable the throttler when the instant count is greater than 2
  createEffect(() => {
    setCountThrottler.setOptions({
      enabled: instantCount() > 2,
    })
  })

  function increment() {
    // this pattern helps avoid common bugs with stale closures and state
    setInstantCount((c) => {
      const newInstantCount = c + 1 // common new value for both
      setCountThrottler.maybeExecute(newInstantCount) // throttled state update
      return newInstantCount // instant state update
    })
  }

  return (
    <div>
      <h1>TanStack Pacer createThrottler Example 1</h1>
      <table>
        <tbody>
          <tr>
            <td>Execution Count:</td>
            <td>{setCountThrottler.executionCount()}</td>
          </tr>
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
  const [throttledSearch, setThrottledSearch] = createSignal('')

  // Lower-level createThrottler hook - requires you to manage your own state
  const setSearchThrottler = createThrottler(setThrottledSearch, {
    wait: 1000,
    enabled: false,
  })

  // enable the throttler when the instant search value is longer than 2 characters
  createEffect(() => {
    setSearchThrottler.setOptions({
      enabled: instantSearch().length > 2,
    })
  })

  function handleSearchChange(e: Event) {
    const target = e.target as HTMLInputElement
    const newValue = target.value
    setInstantSearch(newValue)
    setSearchThrottler.maybeExecute(newValue)
  }

  return (
    <div>
      <h1>TanStack Pacer createThrottler Example 2</h1>
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
            <td>Execution Count:</td>
            <td>{setSearchThrottler.executionCount()}</td>
          </tr>
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
