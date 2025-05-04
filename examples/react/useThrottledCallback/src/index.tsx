import { useState } from 'react'
import ReactDOM from 'react-dom/client'
import { useThrottledCallback } from '@tanstack/react-pacer/throttler'

function App1() {
  // Use your state management library of choice
  const [instantCount, setInstantCount] = useState(0)
  const [throttledCount, setThrottledCount] = useState(0)

  // Create throttled setter function - Stable reference provided by useThrottledCallback
  const throttledSetCount = useThrottledCallback(setThrottledCount, {
    wait: 1000,
    enabled: instantCount > 2,
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
  const [throttledSearchText, setThrottledSearchText] = useState('')

  // Create throttled setter function - Stable reference provided by useThrottledCallback
  const throttledSetSearch = useThrottledCallback(setThrottledSearchText, {
    wait: 1000,
    enabled: searchText.length > 2,
  })

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newValue = e.target.value
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

const root = ReactDOM.createRoot(document.getElementById('root')!)
root.render(
  <div>
    <App1 />
    <hr />
    <App2 />
  </div>,
)
