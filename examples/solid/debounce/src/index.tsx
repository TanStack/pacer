import { createSignal } from 'solid-js'
import { render } from 'solid-js/web'
import { debounce } from '@tanstack/solid-pacer/debouncer'

function App1() {
  // Use your state management library of choice
  const [instantCount, setInstantCount] = createSignal(0)
  const [debouncedCount, setDebouncedCount] = createSignal(0)

  // Create debounced setter function - Stable reference required!
  const debouncedSetCount = debounce(setDebouncedCount, {
    wait: 500,
    // leading: true, // optional, defaults to false
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
      <h1>TanStack Pacer debounce Example 1</h1>
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

  // Create debounced setter function - Stable reference required!
  const debouncedSetSearch = debounce(setDebouncedSearchText, {
    wait: 500,
  })

  function handleSearchChange(e: Event) {
    const target = e.target as HTMLInputElement
    const newValue = target.value
    setSearchText(newValue)
    debouncedSetSearch(newValue)
  }

  return (
    <div>
      <h1>TanStack Pacer debounce Example 2</h1>
      <div>
        <input
          autofocus
          type="search"
          value={searchText()}
          onInput={handleSearchChange}
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

function App3() {
  const [currentValue, setCurrentValue] = createSignal(50)
  const [debouncedValue, setDebouncedValue] = createSignal(50)

  // Create debounced setter function - Stable reference required!
  const debouncedSetValue = debounce(setDebouncedValue, {
    wait: 250,
  })

  function handleRangeChange(e: Event) {
    const target = e.target as HTMLInputElement
    const newValue = parseInt(target.value, 10)
    setCurrentValue(newValue)
    debouncedSetValue(newValue)
  }

  return (
    <div>
      <h1>TanStack Pacer debounce Example 3</h1>
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
          Debounced Range (Readonly):
          <input
            type="range"
            min="0"
            max="100"
            value={debouncedValue()}
            readOnly
            style={{ width: '100%' }}
          />
          <span>{debouncedValue()}</span>
        </label>
      </div>
      <div style={{ color: '#666', 'font-size': '0.9em' }}>
        <p>Debounced with 250ms wait time</p>
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
