import { useState } from 'react'
import ReactDOM from 'react-dom/client'
import { useDebouncedState } from '@tanstack/react-pacer/debouncer'

function App1() {
  const [instantCount, setInstantCount] = useState(0)

  // higher-level hook that uses React.useState with the state setter automatically debounced
  // optionally, grab the debouncer from the last index of the returned array
  const [debouncedCount, setDebouncedCount, debouncer] = useDebouncedState(
    instantCount,
    {
      wait: 500,
      // enabled: instantCount > 2, // optional, defaults to true
      // leading: true, // optional, defaults to false
    },
  )

  function increment() {
    // this pattern helps avoid common bugs with stale closures and state
    setInstantCount((c) => {
      const newInstantCount = c + 1 // common new value for both
      setDebouncedCount(newInstantCount) // debounced state update
      return newInstantCount // instant state update
    })
  }

  return (
    <div>
      <h1>TanStack Pacer useDebouncedState Example 1</h1>
      <table>
        <tbody>
          <tr>
            <td>Enabled:</td>
            <td>{debouncer.getOptions().enabled.toString()}</td>
          </tr>
          <tr>
            <td>Is Pending:</td>
            <td>{debouncer.getIsPending().toString()}</td>
          </tr>
          <tr>
            <td>Execution Count:</td>
            <td>{debouncer.getExecutionCount()}</td>
          </tr>
          <tr>
            <td colSpan={2}>
              <hr />
            </td>
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

  // higher-level hook that uses React.useState with the state setter automatically debounced
  const [debouncedSearch, setDebouncedSearch, debouncer] = useDebouncedState(
    instantSearch,
    {
      wait: 500,
      enabled: instantSearch.length > 2, // optional, defaults to true
    },
  )

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newValue = e.target.value
    setInstantSearch(newValue)
    setDebouncedSearch(newValue)
  }

  return (
    <div>
      <h1>TanStack Pacer useDebouncedState Example 2</h1>
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
            <td>Enabled:</td>
            <td>{debouncer.getOptions().enabled.toString()}</td>
          </tr>
          <tr>
            <td>Is Pending:</td>
            <td>{debouncer.getIsPending().toString()}</td>
          </tr>
          <tr>
            <td>Execution Count:</td>
            <td>{debouncer.getExecutionCount()}</td>
          </tr>
          <tr>
            <td colSpan={2}>
              <hr />
            </td>
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
