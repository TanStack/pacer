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
      // enabled: () => instantCount > 2, // optional, defaults to true
      // leading: true, // optional, defaults to false
    },
    // Optional Selector function to pick the state you want to track and use
    (state) => ({
      isPending: state.isPending,
      executionCount: state.executionCount,
    }),
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
            <td>Is Pending:</td>
            <td>{debouncer.state.isPending.toString()}</td>
          </tr>
          <tr>
            <td>Execution Count:</td>
            <td>{debouncer.state.executionCount}</td>
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
      <pre style={{ marginTop: '20px' }}>
        {JSON.stringify(debouncer.state, null, 2)}
      </pre>
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
    // Optional Selector function to pick the state you want to track and use
    (state) => ({
      isPending: state.isPending,
      executionCount: state.executionCount,
    }),
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
            <td>Is Pending:</td>
            <td>{debouncer.state.isPending.toString()}</td>
          </tr>
          <tr>
            <td>Execution Count:</td>
            <td>{debouncer.state.executionCount}</td>
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
      <pre style={{ marginTop: '20px' }}>
        {JSON.stringify(debouncer.state, null, 2)}
      </pre>
    </div>
  )
}

function App3() {
  const [currentValue, setCurrentValue] = useState(50)
  const [instantExecutionCount, setInstantExecutionCount] = useState(0)

  // higher-level hook that uses React.useState with the state setter automatically debounced
  const [debouncedValue, setDebouncedValue, debouncer] = useDebouncedState(
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
    setDebouncedValue(newValue)
  }

  return (
    <div>
      <h1>TanStack Pacer useDebouncedState Example 3</h1>
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
