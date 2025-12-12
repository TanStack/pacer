import { useState } from 'preact/hooks'
import { render } from 'preact'
import type { JSX } from 'preact'
import { useDebouncedCallback } from '@tanstack/preact-pacer/debouncer'

function App1() {
  // Use your state management library of choice
  const [instantCount, setInstantCount] = useState(0)
  const [debouncedCount, setDebouncedCount] = useState(0)

  // Create debounced setter function - Stable reference provided by useDebouncedCallback
  const debouncedSetCount = useDebouncedCallback(setDebouncedCount, {
    wait: 500,
    // enabled: () => instantCount > 2, // optional, defaults to true
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
      <h1>TanStack Pacer useDebouncedCallback Example 1</h1>
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

  // Create debounced setter function - Stable reference provided by useDebouncedCallback
  const debouncedSetSearch = useDebouncedCallback(setDebouncedSearchText, {
    wait: 500,
    enabled: () => searchText.length > 2,
  })

  function handleSearchChange(e: JSX.TargetedEvent<HTMLInputElement>) {
    const newValue = e.currentTarget.value
    setSearchText(newValue)
    debouncedSetSearch(newValue)
  }

  return (
    <div>
      <h1>TanStack Pacer useDebouncedCallback Example 2</h1>
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
  const [currentValue, setCurrentValue] = useState(50)
  const [debouncedValue, setDebouncedValue] = useState(50)

  // Create debounced setter function - Stable reference provided by useDebouncedCallback
  const debouncedSetValue = useDebouncedCallback(setDebouncedValue, {
    wait: 250,
  })

  function handleRangeChange(e: JSX.TargetedEvent<HTMLInputElement>) {
    const newValue = parseInt(e.currentTarget.value, 10)
    setCurrentValue(newValue)
    debouncedSetValue(newValue)
  }

  return (
    <div>
      <h1>TanStack Pacer useDebouncedCallback Example 3</h1>
      <div style={{ marginBottom: '20px' }}>
        <label>
          Current Range:
          <input
            type="range"
            min="0"
            max="100"
            value={currentValue}
            onInput={handleRangeChange}
            style={{ width: '100%' }}
          />
          <span>{currentValue}</span>
        </label>
      </div>
      <div style={{ marginBottom: '20px' }}>
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
      <div style={{ color: '#666', fontSize: '0.9em' }}>
        <p>Debounced to 250ms wait time</p>
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
