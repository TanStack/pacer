import { useState } from 'react'
import ReactDOM from 'react-dom/client'
import { useDebouncedValue } from '@tanstack/react-pacer/debouncer'

function App1() {
  const [instantCount, setInstantCount] = useState(0)

  function increment() {
    setInstantCount((c) => c + 1)
  }

  // highest-level hook that watches an instant local state value and returns a debounced value
  // optionally, grab the debouncer from the last index of the returned array
  const [debouncedCount, debouncer] = useDebouncedValue(instantCount, {
    wait: 500,
    // enabled: instantCount > 2, // optional, defaults to true
  })

  return (
    <div>
      <h1>TanStack Pacer useDebouncedValue Example 1</h1>
      <table>
        <tbody>
          <tr>
            <td>Execution Count:</td>
            <td>{debouncer.getExecutionCount()}</td>
          </tr>
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
  const [instantSearch, setInstantSearch] = useState('')

  // highest-level hook that watches an instant local state value and returns a debounced value
  const [debouncedSearch, debouncer] = useDebouncedValue(instantSearch, {
    wait: 500,
    // enabled: instantSearch.length > 2, // optional, defaults to true
  })

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInstantSearch(e.target.value)
  }

  return (
    <div>
      <h1>TanStack Pacer useDebouncedValue Example 2</h1>
      <div>
        <input
          type="text"
          value={instantSearch}
          onChange={handleSearchChange}
          placeholder="Type to search..."
          style={{ width: '100%' }}
        />
      </div>
      <table>
        <tbody>
          <tr>
            <td>Execution Count:</td>
            <td>{debouncer.getExecutionCount()}</td>
          </tr>
          <tr>
            <td>Instant Search:</td>
            <td>{instantSearch}</td>
          </tr>
          <tr>
            <td>Debounced Search:</td>
            <td>{debouncedSearch}</td>
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
