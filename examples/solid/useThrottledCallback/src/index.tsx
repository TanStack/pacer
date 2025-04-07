import { createSignal } from 'solid-js'
import { render } from 'solid-js/web'
import { useThrottledCallback } from '@tanstack/solid-pacer/throttler'

function App1() {
  // Use your state management library of choice
  const [instantCount, setInstantCount] = createSignal(0)
  const [throttledCount, setThrottledCount] = createSignal(0)

  // Create throttled setter function - Stable reference provided by useThrottledCallback
  const throttledSetCount = useThrottledCallback(setThrottledCount, {
    wait: 1000,
    enabled: instantCount() > 2,
  })

  function increment() {
    // this pattern helps avoid common bugs with stale closures and state
    setInstantCount((c) => {
      const newInstantCount = c + 1 // common new value for both
      throttledSetCount(newInstantCount) // throttled state update
      return newInstantCount // instant state update
    })
  }

  return (
    <div>
      <h1>TanStack Pacer useThrottledCallback Example 1</h1>
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
  const [searchText, setSearchText] = createSignal('')
  const [throttledSearchText, setThrottledSearchText] = createSignal('')

  // Create throttled setter function - Stable reference provided by useThrottledCallback
  const throttledSetSearch = useThrottledCallback(setThrottledSearchText, {
    wait: 1000,
    enabled: searchText.length > 2,
  })

  function handleSearchChange(e: Event) {
    const target = e.target as HTMLInputElement;
  const newValue = target.value
    setSearchText(newValue)
    throttledSetSearch(newValue)
  }

  return (
    <div>
      <h1>TanStack Pacer useThrottledCallback Example 2</h1>
      <div>
        <input
          type="text"
          value={searchText()}
          onChange={handleSearchChange}
          placeholder="Type to search..."
          style={{ width: '100%' }}
        />
      </div>
      <table>
        <tbody>
          <tr>
            <td>Instant Search:</td>
            <td>{searchText()}</td>
          </tr>
          <tr>
            <td>Throttled Search:</td>
            <td>{throttledSearchText()}</td>
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
