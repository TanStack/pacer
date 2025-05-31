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
    // enabled: () => instantCount > 2, // optional, defaults to true
    // leading: true, // optional, defaults to false
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
            <td>Enabled:</td>
            <td>{setCountDebouncer.getEnabled().toString()}</td>
          </tr>
          <tr>
            <td>Is Pending:</td>
            <td>{setCountDebouncer.getIsPending().toString()}</td>
          </tr>
          <tr>
            <td>Execution Count:</td>
            <td>{setCountDebouncer.getExecutionCount()}</td>
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
  const [searchText, setSearchText] = useState('')
  const [debouncedSearchText, setDebouncedSearchText] = useState('')

  // Lower-level useDebouncer hook - requires you to manage your own state
  const setSearchDebouncer = useDebouncer(setDebouncedSearchText, {
    wait: 500,
    enabled: () => searchText.length > 2, // optional, defaults to true
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
          autoFocus
          type="search"
          value={searchText}
          onChange={handleSearchChange}
          placeholder="Type to search..."
          style={{ width: '100%', marginBottom: '1rem' }}
        />
      </div>
      <table>
        <tbody>
          <tr>
            <td>Enabled:</td>
            <td>{setSearchDebouncer.getOptions().enabled.toString()}</td>
          </tr>
          <tr>
            <td>Is Pending:</td>
            <td>{setSearchDebouncer.getIsPending().toString()}</td>
          </tr>
          <tr>
            <td>Execution Count:</td>
            <td>{setSearchDebouncer.getExecutionCount()}</td>
          </tr>
          <tr>
            <td colSpan={2}>
              <hr />
            </td>
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

function App3() {
  const [currentValue, setCurrentValue] = useState(50)
  const [debouncedValue, setDebouncedValue] = useState(50)
  const [instantExecutionCount, setInstantExecutionCount] = useState(0)

  // Lower-level useDebouncer hook - requires you to manage your own state
  const setValueDebouncer = useDebouncer(setDebouncedValue, {
    wait: 250,
  })

  function handleRangeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newValue = parseInt(e.target.value, 10)
    setCurrentValue(newValue)
    setInstantExecutionCount((c) => c + 1)
    setValueDebouncer.maybeExecute(newValue)
  }

  return (
    <div>
      <h1>TanStack Pacer useDebouncer Example 3</h1>
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
      <table>
        <tbody>
          <tr>
            <td>Enabled:</td>
            <td>{setValueDebouncer.getEnabled().toString()}</td>
          </tr>
          <tr>
            <td>Is Pending:</td>
            <td>{setValueDebouncer.getIsPending().toString()}</td>
          </tr>
          <tr>
            <td>Instant Executions:</td>
            <td>{instantExecutionCount}</td>
          </tr>
          <tr>
            <td>Debounced Executions:</td>
            <td>{setValueDebouncer.getExecutionCount()}</td>
          </tr>
          <tr>
            <td>Saved Executions:</td>
            <td>
              {instantExecutionCount - setValueDebouncer.getExecutionCount()}
            </td>
          </tr>
          <tr>
            <td>% Reduction:</td>
            <td>
              {instantExecutionCount === 0
                ? '0'
                : Math.round(
                    ((instantExecutionCount -
                      setValueDebouncer.getExecutionCount()) /
                      instantExecutionCount) *
                      100,
                  )}
              %
            </td>
          </tr>
        </tbody>
      </table>
      <div style={{ color: '#666', fontSize: '0.9em' }}>
        <p>Debounced to 250ms wait time</p>
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
