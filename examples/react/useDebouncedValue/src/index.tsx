import { useState } from 'react'
import ReactDOM from 'react-dom/client'
import { useDebouncedValue } from '@tanstack/react-pacer/debouncer'

function App1() {
  const [instantCount, setInstantCount] = useState(0)

  function increment() {
    setInstantCount((c) => c + 1)
  }

  // highest-level hook that watches an instant local state value and returns a debounced value
  const [debouncedCount] = useDebouncedValue(
    instantCount,
    {
      wait: 500,
      // enabled: () => instantCount > 2, // optional, defaults to true
      // leading: true, // optional, defaults to false
    },
    // Optional Selector function to pick the state you want to track and use
    (_state) => ({}), // No specific state access needed for this example
  )

  return (
    <div>
      <h1>TanStack Pacer useDebouncedValue Example 1</h1>
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
  const [instantSearch, setInstantSearch] = useState('')

  // highest-level hook that watches an instant local state value and returns a debounced value
  // optionally, grab the debouncer from the last index of the returned array
  const [debouncedSearch] = useDebouncedValue(
    instantSearch,
    {
      wait: 500,
      enabled: instantSearch.length > 2, // optional, defaults to true
    },
    // Optional Selector function to pick the state you want to track and use
    (_state) => ({}), // No specific state access needed for this example
  )

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInstantSearch(e.target.value)
  }

  return (
    <div>
      <h1>TanStack Pacer useDebouncedValue Example 2</h1>
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

function App3() {
  const [currentValue, setCurrentValue] = useState(50)
  const [instantExecutionCount, setInstantExecutionCount] = useState(0)

  // highest-level hook that watches an instant local state value and returns a debounced value
  const [debouncedValue, debouncer] = useDebouncedValue(
    currentValue,
    {
      wait: 250,
    },
    // Optional Selector function to pick the state you want to track and use
    (state) => ({
      isPending: state.isPending,
      executionCount: state.executionCount,
    }),
  )

  function handleRangeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newValue = parseInt(e.target.value, 10)
    setCurrentValue(newValue)
    setInstantExecutionCount((c) => c + 1)
  }

  return (
    <div>
      <h1>TanStack Pacer useDebouncedValue Example 3</h1>
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
            <td>Is Pending:</td>
            <td>{debouncer.state.isPending.toString()}</td>
          </tr>
          <tr>
            <td>Instant Executions:</td>
            <td>{instantExecutionCount}</td>
          </tr>
          <tr>
            <td>Debounced Executions:</td>
            <td>{debouncer.state.executionCount}</td>
          </tr>
          <tr>
            <td>Saved Executions:</td>
            <td>{instantExecutionCount - debouncer.state.executionCount}</td>
          </tr>
          <tr>
            <td>% Reduction:</td>
            <td>
              {instantExecutionCount === 0
                ? '0'
                : Math.round(
                    ((instantExecutionCount - debouncer.state.executionCount) /
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
      <pre style={{ marginTop: '20px' }}>
        {JSON.stringify(debouncer.state, null, 2)}
      </pre>
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
