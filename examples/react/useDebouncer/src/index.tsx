import { useState } from 'react'
import ReactDOM from 'react-dom/client'
import { useDebouncer } from '@tanstack/react-pacer/debouncer'
import { PacerProvider } from '@tanstack/react-pacer/provider'

function App1() {
  // Use your state management library of choice
  const [instantCount, setInstantCount] = useState(0)
  const [debouncedCount, setDebouncedCount] = useState(0)

  // Lower-level useDebouncer hook - requires you to manage your own state
  const debouncer = useDebouncer(
    setDebouncedCount,
    {
      wait: 800,
      enabled: () => instantCount > 2, // optional, defaults to true
      // leading: true, // optional, defaults to false
    },
    // Alternative to debouncer.Subscribe: pass a selector as 3rd arg to cause re-renders and subscribe to state
    // (state) => state,
  )

  function increment() {
    // this pattern helps avoid common bugs with stale closures and state
    setInstantCount((c) => {
      const newInstantCount = c + 1 // common new value for both
      debouncer.maybeExecute(newInstantCount) // debounced state update
      return newInstantCount // instant state update
    })
  }

  return (
    <div>
      <h1>TanStack Pacer useDebouncer Example 1</h1>
      <table>
        <tbody>
          <debouncer.Subscribe
            selector={(state) => ({
              status: state.status,
              executionCount: state.executionCount,
            })}
          >
            {({ status, executionCount }) => (
              <>
                <tr>
                  <td>Status:</td>
                  <td>{status}</td>
                </tr>
                <tr>
                  <td>Execution Count:</td>
                  <td>{executionCount}</td>
                </tr>
              </>
            )}
          </debouncer.Subscribe>
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
        <button
          onClick={() => debouncer.flush()}
          style={{ marginLeft: '10px' }}
        >
          Flush
        </button>
      </div>
      <debouncer.Subscribe selector={(state) => state}>
        {(state) => (
          <pre style={{ marginTop: '20px' }}>
            {JSON.stringify(state, null, 2)}
          </pre>
        )}
      </debouncer.Subscribe>
    </div>
  )
}

function App2() {
  const [searchText, setSearchText] = useState('')
  const [debouncedSearchText, setDebouncedSearchText] = useState('')

  // Lower-level useDebouncer hook - requires you to manage your own state
  const setSearchDebouncer = useDebouncer(
    setDebouncedSearchText,
    {
      wait: 500,
      enabled: () => searchText.length > 2, // optional, defaults to true
    },
    // Alternative to setSearchDebouncer.Subscribe: pass a selector as 3rd arg to cause re-renders and subscribe to state
    // (state) => state,
  )

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
          <setSearchDebouncer.Subscribe
            selector={(state) => ({
              isPending: state.isPending,
              executionCount: state.executionCount,
            })}
          >
            {({ isPending, executionCount }) => (
              <>
                <tr>
                  <td>Is Pending:</td>
                  <td>{isPending.toString()}</td>
                </tr>
                <tr>
                  <td>Execution Count:</td>
                  <td>{executionCount}</td>
                </tr>
              </>
            )}
          </setSearchDebouncer.Subscribe>
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
      <div>
        <button onClick={() => setSearchDebouncer.flush()}>Flush</button>
      </div>
      <setSearchDebouncer.Subscribe selector={(state) => state}>
        {(state) => (
          <pre style={{ marginTop: '20px' }}>
            {JSON.stringify(state, null, 2)}
          </pre>
        )}
      </setSearchDebouncer.Subscribe>
    </div>
  )
}

function App3() {
  const [currentValue, setCurrentValue] = useState(50)
  const [debouncedValue, setDebouncedValue] = useState(50)
  const [instantExecutionCount, setInstantExecutionCount] = useState(0)

  // Lower-level useDebouncer hook - requires you to manage your own state
  const setValueDebouncer = useDebouncer(
    setDebouncedValue,
    {
      wait: 250,
    },
    // Alternative to setValueDebouncer.Subscribe: pass a selector as 3rd arg to cause re-renders and subscribe to state
    // (state) => state,
  )

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
          <setValueDebouncer.Subscribe
            selector={(state) => ({
              isPending: state.isPending,
              executionCount: state.executionCount,
            })}
          >
            {({ isPending, executionCount }) => (
              <>
                <tr>
                  <td>Is Pending:</td>
                  <td>{isPending.toString()}</td>
                </tr>
                <tr>
                  <td>Instant Executions:</td>
                  <td>{instantExecutionCount}</td>
                </tr>
                <tr>
                  <td>Debounced Executions:</td>
                  <td>{executionCount}</td>
                </tr>
                <tr>
                  <td>Saved Executions:</td>
                  <td>{instantExecutionCount - executionCount}</td>
                </tr>
                <tr>
                  <td>% Reduction:</td>
                  <td>
                    {instantExecutionCount === 0
                      ? '0'
                      : Math.round(
                          ((instantExecutionCount - executionCount) /
                            instantExecutionCount) *
                            100,
                        )}
                    %
                  </td>
                </tr>
              </>
            )}
          </setValueDebouncer.Subscribe>
        </tbody>
      </table>
      <div style={{ color: '#666', fontSize: '0.9em' }}>
        <p>Debounced to 250ms wait time</p>
      </div>
      <div>
        <button onClick={() => setValueDebouncer.flush()}>Flush</button>
      </div>
      <setValueDebouncer.Subscribe selector={(state) => state}>
        {(state) => (
          <pre style={{ marginTop: '20px' }}>
            {JSON.stringify(state, null, 2)}
          </pre>
        )}
      </setValueDebouncer.Subscribe>
    </div>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root')!)
root.render(
  // optionally, provide default options to an optional PacerProvider
  <PacerProvider
  // defaultOptions={{
  //   debouncer: {
  //     leading: true,
  //   },
  // }}
  >
    <div>
      <App1 />
      <hr />
      <App2 />
      <hr />
      <App3 />
    </div>
    ,
  </PacerProvider>,
)
