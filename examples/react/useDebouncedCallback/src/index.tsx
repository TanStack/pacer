import { useState } from 'react'
import ReactDOM from 'react-dom/client'
import { useDebouncedCallback } from '@tanstack/react-pacer/debouncer'

function App1() {
  // Use your state management library of choice
  const [instantCount, setInstantCount] = useState(0)
  const [debouncedCount, setDebouncedCount] = useState(0)

  // Create debounced setter function - Stable reference provided by useDebouncedCallback
  const debouncedSetCount = useDebouncedCallback(setDebouncedCount, {
    wait: 500,
    // enabled: instantCount > 2, // optional, defaults to true
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
    enabled: searchText.length > 2,
  })

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newValue = e.target.value
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
            <td>Debounced Search:</td>
            <td>{debouncedSearchText}</td>
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
