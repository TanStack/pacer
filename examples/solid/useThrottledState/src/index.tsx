import { createSignal } from 'solid-js'
import { render } from 'solid-js/web'
import { useThrottledState } from '@tanstack/solid-pacer/throttler'

function App1() {
  const [instantCount, setInstantCount] = createSignal(0)

  // higher-level hook that uses React.createSignal with the state setter automatically throttled
  // optionally, grab the throttler from the last index of the returned array
  const [throttledCount, setThrottledCount, throttler] = useThrottledState(
    instantCount,
    {
      wait: 1000,
      // enabled: instantCount() > 2, // optional, defaults to true
    },
  )

  function increment() {
    // this pattern helps avoid common bugs with stale closures and state
    setInstantCount((c) => {
      const newInstantCount = c + 1 // common new value for both
      setThrottledCount(() => () => newInstantCount) // throttled state update
      return newInstantCount // instant state update
    })
  }

  return (
    <div>
      <h1>TanStack Pacer useThrottledState Example 1</h1>
      <table>
        <tbody>
          <tr>
            <td>Execution Count:</td>
            <td>{throttler().getExecutionCount()}</td>
          </tr>
          <tr>
            <td>Instant Count:</td>
            <td>{instantCount()}</td>
          </tr>
          <tr>
            <td>Throttled Count:</td>
            <td>{throttledCount()()}</td>
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

  // higher-level hook that uses React.createSignal with the state setter automatically throttled
  const [throttledSearch, setThrottledSearch, throttler] = useThrottledState(
    instantSearch,
    {
      wait: 1000,
      // enabled: instantSearch.length > 2, // optional, defaults to true
    },
  )

  function handleSearchChange(e: Event) {
    const target = e.target as HTMLInputElement
    const newValue = target.value
    setInstantSearch(() => newValue)
    setThrottledSearch(() => () => newValue)
  }

  return (
    <div>
      <h1>TanStack Pacer useThrottledState Example 2</h1>
      <div>
        <input
          type="text"
          value={instantSearch()}
          onChange={handleSearchChange}
          placeholder="Type to search..."
          style={{ width: '100%' }}
        />
      </div>
      <table>
        <tbody>
          <tr>
            <td>Execution Count:</td>
            <td>{throttler().getExecutionCount()}</td>
          </tr>
          <tr>
            <td>Instant Search:</td>
            <td>{instantSearch()}</td>
          </tr>
          <tr>
            <td>Throttled Search:</td>
            <td>{throttledSearch()()}</td>
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
