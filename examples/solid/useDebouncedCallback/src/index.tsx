import { createSignal } from 'solid-js'
import { render } from 'solid-js/web'
import { useDebouncedCallback } from '@tanstack/solid-pacer/debouncer'

function App1() {
  // Use your state management library of choice
  const [instantCount, setInstantCount] = createSignal(0)
  const [debouncedCount, setDebouncedCount] = createSignal(0)

  // Create debounced setter function - Stable reference provided by useDebouncedCallback
  const debouncedSetCount = useDebouncedCallback(setDebouncedCount, {
    wait: 500,
    enabled: instantCount() > 2,
  })

  function increment() {
    // this pattern helps avoid common bugs with stale closures and state
    setInstantCount((c) => {
      const newInstantCount = c + 1 // common new value for both
      debouncedSetCount(newInstantCount) // debounced state update
      return newInstantCount // instant state update
    })
  }

  return (
    <div>
      <h1>TanStack Pacer useDebouncedCallback Example 1</h1>
      <table>
        <tbody>
          <tr>
            <td>Instant Count:</td>
            <td>{instantCount()}</td>
          </tr>
          <tr>
            <td>Debounced Count:</td>
            <td>{debouncedCount()}</td>
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
  const [debouncedSearchText, setDebouncedSearchText] = createSignal('')

  // Create debounced setter function - Stable reference provided by useDebouncedCallback
  const debouncedSetSearch = useDebouncedCallback(setDebouncedSearchText, {
    wait: 500,
    enabled: searchText.length > 2,
  })

  function handleSearchChange(e: Event) {
    const target = e.target as HTMLInputElement;
  const newValue = target.value
    setSearchText(newValue)
    debouncedSetSearch(newValue)
  }

  return (
    <div>
      <h1>TanStack Pacer useDebouncedCallback Example 2</h1>
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
            <td>Debounced Search:</td>
            <td>{debouncedSearchText()}</td>
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
