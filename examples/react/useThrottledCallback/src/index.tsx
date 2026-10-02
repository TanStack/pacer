import { useRef, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { useThrottledCallback } from '@tanstack/react-pacer/throttler'

function App1() {
  // Use your state management library of choice
  const [instantCount, setInstantCount] = useState(0)
  const instantCountRef = useRef(0)
  const [throttledCount, setThrottledCount] = useState(0)

  // Create throttled setter function - Stable reference provided by useThrottledCallback
  const throttledSetCount = useThrottledCallback(setThrottledCount, {
    wait: 1000,
    enabled: () => instantCountRef.current > 2,
  })

  function increment() {
    const nextCount = ++instantCountRef.current
    setInstantCount(nextCount)
    throttledSetCount(nextCount)
  }

  return (
    <div>
      <h1>TanStack Pacer useThrottledCallback Example 1</h1>
      <table>
        <tbody>
          <tr>
            <td>Instant Count:</td>
            <td>{instantCount}</td>
          </tr>
          <tr>
            <td>Throttled Count:</td>
            <td>{throttledCount}</td>
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
  const searchTextRef = useRef('')
  const [throttledSearchText, setThrottledSearchText] = useState('')

  // Create throttled setter function - Stable reference provided by useThrottledCallback
  const throttledSetSearch = useThrottledCallback(setThrottledSearchText, {
    wait: 1000,
    enabled: () => searchTextRef.current.length > 2,
  })

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newValue = e.target.value
    searchTextRef.current = newValue
    setSearchText(newValue)
    throttledSetSearch(newValue)
  }

  return (
    <div>
      <h1>TanStack Pacer useThrottledCallback Example 2</h1>
      <div>
        <input
          autoFocus
          type="search"
          value={searchText}
          onChange={handleSearchChange}
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
            <td>Throttled Search:</td>
            <td>{throttledSearchText}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

function App3() {
  const [currentValue, setCurrentValue] = useState(50)
  const [throttledValue, setThrottledValue] = useState(50)

  // Create throttled setter function - Stable reference provided by useThrottledCallback
  const throttledSetValue = useThrottledCallback(setThrottledValue, {
    wait: 250,
  })

  function handleRangeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newValue = parseInt(e.target.value, 10)
    setCurrentValue(newValue)
    throttledSetValue(newValue)
  }

  return (
    <div>
      <h1>TanStack Pacer useThrottledCallback Example 3</h1>
      <div style={{ marginBottom: '20px' }}>
        <label>
          Current Range:
          <input
            type="range"
            min="0"
            max="100"
            value={currentValue}
            onChange={handleRangeChange}
            style={{ width: '100%' }}
          />
          <span>{currentValue}</span>
        </label>
      </div>
      <div style={{ marginBottom: '20px' }}>
        <label>
          Throttled Range (Readonly):
          <input
            type="range"
            min="0"
            max="100"
            value={throttledValue}
            disabled
            style={{ width: '100%' }}
          />
          <span>{throttledValue}</span>
        </label>
      </div>
      <div style={{ color: '#666', fontSize: '0.9em' }}>
        <p>Throttled to 1 update per 250ms</p>
      </div>
    </div>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root')!)
root.render(
  <div>
    <App1 />
    <hr />
    <App2 />
    <hr />
    <App3 />
  </div>,
)
