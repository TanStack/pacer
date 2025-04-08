import { useState } from 'react'
import ReactDOM from 'react-dom/client'
import { useDebouncer } from '@tanstack/react-pacer/debouncer'

function App1() {
  // Use your state management library of choice
  const [instantCount, setInstantCount] = useState(0)
  const [debouncedCount, setDebouncedCount] = useState(0)

  // Lower-level useDebouncer hook - requires you to manage your own state
  const setCountDebouncer = useDebouncer(setDebouncedCount, {
    wait: 500,
    enabled: instantCount > 2, // optional, defaults to true
  })

  function increment() {
    // this pattern helps avoid common bugs with stale closures and state
    setInstantCount((c) => {
      const newInstantCount = c + 1 // common new value for both
      setCountDebouncer.maybeExecute(newInstantCount) // debounced state update
      return newInstantCount // instant state update
    })
  }

  return (
    <div>
      <h1>TanStack Pacer useDebouncer Example 1</h1>
      <table>
        <tbody>
          <tr>
            <td>Execution Count:</td>
            <td>{setCountDebouncer.getExecutionCount()}</td>
          </tr>
          <tr>
            <td>Is Pending:</td>
            <td>{setCountDebouncer.getIsPending().toString()}</td>
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
  const [searchText, setSearchText] = useState('')
  const [debouncedSearchText, setDebouncedSearchText] = useState('')
  const [leading, setLeading] = useState(false)
  const [trailing, setTrailing] = useState(true)

  // Lower-level useDebouncer hook - requires you to manage your own state
  const setSearchDebouncer = useDebouncer(setDebouncedSearchText, {
    wait: 500,
    enabled: searchText.length > 2, // optional, defaults to true
    leading,
    trailing,
  })

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newValue = e.target.value
    setSearchText(newValue)
    setSearchDebouncer.maybeExecute(newValue)
  }

  return (
    <div>
      <h1>TanStack Pacer useDebouncer Example 2</h1>
      <div>
        <input
          type="checkbox"
          name="leading"
          id="leading"
          checked={leading}
          onChange={() => setLeading((t) => !t)}
        />
        <label htmlFor="leading">Leading</label>
        <input
          type="checkbox"
          name="trailing"
          id="trailing"
          checked={trailing}
          onChange={() => setTrailing((t) => !t)}
        />
        <label htmlFor="trailing">Trailing</label>
      </div>
      <div>
        <input
          type="text"
          value={searchText}
          onChange={handleSearchChange}
          placeholder="Type to search..."
          style={{ width: '100%' }}
        />
      </div>
      <table>
        <tbody>
          <tr>
            <td>Execution Count:</td>
            <td>{setSearchDebouncer.getExecutionCount()}</td>
          </tr>
          <tr>
            <td>Is Pending:</td>
            <td>{setSearchDebouncer.getIsPending().toString()}</td>
          </tr>
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
