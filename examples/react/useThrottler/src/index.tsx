import { useState } from 'react'
import ReactDOM from 'react-dom/client'
import { useThrottler } from '@tanstack/react-pacer/throttler'

function App1() {
  // Use your state management library of choice
  const [instantCount, setInstantCount] = useState(0)
  const [throttledCount, setThrottledCount] = useState(0)

  // Lower-level useThrottler hook - requires you to manage your own state
  const setCountThrottler = useThrottler(setThrottledCount, {
    wait: 1000,
    leading: false,
    // trailing: true,
    // enabled: instantCount > 2,
  })

  function increment() {
    // this pattern helps avoid common bugs with stale closures and state
    setInstantCount((c) => {
      const newInstantCount = c + 1 // common new value for both
      setCountThrottler.maybeExecute(newInstantCount) // throttled state update
      return newInstantCount // instant state update
    })
  }

  return (
    <div>
      <h1>TanStack Pacer useThrottler Example 1</h1>
      <table>
        <tbody>
          <tr>
            <td>Execution Count:</td>
            <td>{setCountThrottler.getExecutionCount()}</td>
          </tr>
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
  const [instantSearch, setInstantSearch] = useState('')
  const [throttledSearch, setThrottledSearch] = useState('')

  // Lower-level useThrottler hook - requires you to manage your own state
  const setSearchThrottler = useThrottler(setThrottledSearch, {
    wait: 1000,
    enabled: instantSearch.length > 2,
  })

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newValue = e.target.value
    setInstantSearch(newValue)
    setSearchThrottler.maybeExecute(newValue)
  }

  return (
    <div>
      <h1>TanStack Pacer useThrottler Example 2</h1>
      <div>
        <input
          autoFocus
          type="search"
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
            <td>{setSearchThrottler.getExecutionCount()}</td>
          </tr>
          <tr>
            <td>Instant Search:</td>
            <td>{instantSearch}</td>
          </tr>
          <tr>
            <td>Throttled Search:</td>
            <td>{throttledSearch}</td>
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
