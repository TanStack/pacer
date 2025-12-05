import { useCallback, useState } from 'preact/hooks'
import { render } from 'preact'
import type { JSX } from 'preact'
import { debounce } from '@tanstack/preact-pacer/debouncer'

function App1() {
  // Use your state management library of choice
  const [instantCount, setInstantCount] = useState(0)
  const [debouncedCount, setDebouncedCount] = useState(0)

  // Create debounced setter function - Stable reference required!
  const debouncedSetCount = useCallback(
    debounce(setDebouncedCount, {
      wait: 500,
      // leading: true, // optional, defaults to false
    }),
    [], // must be memoized to avoid re-creating the debouncer on every render (consider using useDebouncer instead in preact)
  )

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
            <td>{instantCount}</td>
          </tr>
          <tr>
            <td>Debounced Count:</td>
            <td>{debouncedCount}</td>
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
  const [searchText, setSearchText] = useState('')
  const [debouncedSearchText, setDebouncedSearchText] = useState('')

  // Create debounced setter function - Stable reference required!
  const debouncedSetSearch = useCallback(
    debounce(setDebouncedSearchText, {
      wait: 500,
    }),
    [],
  )

  function handleSearchChange(e: JSX.TargetedEvent<HTMLInputElement>) {
    const newValue = e.currentTarget.value
    setSearchText(newValue)
    debouncedSetSearch(newValue)
  }

  return (
    <div>
      <h1>TanStack Pacer debounce Example 2</h1>
      <div>
        <input
          autoFocus
          type="search"
          value={searchText}
          onInput={handleSearchChange}
          placeholder="Type to search..."
          style={{ width: '100%' }}
        />
      </div>
      <table>
        <tbody>
          <tr>
            <td>Instant Search:</td>
            <td>{searchText}</td>
          </tr>
          <tr>
            <td>Debounced Search:</td>
            <td>{debouncedSearchText}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

function App3() {
  const [instantValue, setInstantValue] = useState(50)
  const [debouncedValue, setDebouncedValue] = useState(50)

  // Create debounced setter function - Stable reference required!
  const debouncedSetValue = useCallback(
    debounce(setDebouncedValue, {
      wait: 250,
    }),
    [],
  )

  function handleRangeChange(e: JSX.TargetedEvent<HTMLInputElement>) {
    const newValue = parseInt(e.currentTarget.value, 10)
    setInstantValue(newValue)
    debouncedSetValue(newValue)
  }

  return (
    <div>
      <h1>TanStack Pacer debounce Example 3</h1>
      <div style={{ marginBottom: '20px' }}>
        <label>
          Instant Range:
          <input
            type="range"
            min="0"
            max="100"
            value={instantValue}
            onInput={handleRangeChange}
            style={{ width: '100%' }}
          />
          <span>{instantValue}</span>
        </label>
      </div>
      <div>
        <label>
          Debounced Range (Readonly):
          <input
            type="range"
            min="0"
            max="100"
            value={debouncedValue}
            readOnly
            style={{ width: '100%' }}
          />
          <span>{debouncedValue}</span>
        </label>
      </div>
    </div>
  )
}

const root = document.getElementById('root')!
render(
  <div>
    <App1 />
    <hr />
    <App2 />
    <hr />
    <App3 />
  </div>,
  root,
)
