import { createSignal } from 'solid-js'
import { render } from 'solid-js/web'
import { createDebouncer } from '@tanstack/solid-pacer/debouncer'

function App1() {
  // Use your state management library of choice
  const [instantCount, setInstantCount] = createSignal(0)
  const [debouncedCount, setDebouncedCount] = createSignal(0)

  // Lower-level createDebouncer hook - requires you to manage your own state
  const setCountDebouncer = createDebouncer(setDebouncedCount, {
    wait: 500,
    enabled: instantCount() > 2, // optional, defaults to true
  })

  function increment() {
    // this pattern helps avoid common bugs with stale closures and state
    setInstantCount((c) => {
      const newInstantCount = c + 1 // common new value for both
      setCountDebouncer().maybeExecute(newInstantCount) // debounced state update
      return newInstantCount // instant state update
    })
  }

  return (
    <div>
      <h1>TanStack Pacer createDebouncer Example 1</h1>
      <table>
        <tbody>
          <tr>
            <td>Execution Count:</td>
            <td>{setCountDebouncer().getExecutionCount()}</td>
          </tr>
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

  // Lower-level createDebouncer hook - requires you to manage your own state
  const setSearchDebouncer = createDebouncer(setDebouncedSearchText, {
    wait: 500,
    enabled: searchText.length > 2, // optional, defaults to true
  })

  function handleSearchChange(e: Event) {
    const target = e.target as HTMLInputElement
    const newValue = target.value
    setSearchText(newValue)
    setSearchDebouncer().maybeExecute(newValue)
  }

  return (
    <div>
      <h1>TanStack Pacer createDebouncer Example 2</h1>
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
            <td>Execution Count:</td>
            <td>{setSearchDebouncer().getExecutionCount()}</td>
          </tr>
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
