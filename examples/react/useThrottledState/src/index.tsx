import { useState } from 'react'
import ReactDOM from 'react-dom/client'
import { useThrottledState } from '@tanstack/react-pacer/throttler'

function App1() {
  const [instantCount, setInstantCount] = useState(0)

  // higher-level hook that uses React.useState with the state setter automatically throttled
  // optionally, grab the throttler from the last index of the returned array
  const [throttledCount, setThrottledCount, throttler] = useThrottledState(
    instantCount,
    {
      wait: 1000,
      // enabled: () => instantCount > 2, // optional, defaults to true
    },
  )

  function increment() {
    // this pattern helps avoid common bugs with stale closures and state
    setInstantCount((c) => {
      const newInstantCount = c + 1 // common new value for both
      setThrottledCount(newInstantCount) // throttled state update
      return newInstantCount // instant state update
    })
  }

  return (
    <div>
      <h1>TanStack Pacer useThrottledState Example 1</h1>
      <table>
        <tbody>
          <tr>
            <td>Execution Count:</td>
            <td>{throttler.state.executionCount}</td>
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
      <pre style={{ marginTop: '20px' }}>
        {JSON.stringify(throttler.state, null, 2)}
      </pre>
    </div>
  )
}

function App2() {
  const [instantSearch, setInstantSearch] = useState('')

  // higher-level hook that uses React.useState with the state setter automatically throttled
  const [throttledSearch, setThrottledSearch, throttler] = useThrottledState(
    instantSearch,
    {
      wait: 1000,
      // enabled: instantSearch.length > 2, // optional, defaults to true
    },
  )

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newValue = e.target.value
    setInstantSearch(newValue)
    setThrottledSearch(newValue)
  }

  return (
    <div>
      <h1>TanStack Pacer useThrottledState Example 2</h1>
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
            <td>{throttler.state.executionCount}</td>
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
      <pre style={{ marginTop: '20px' }}>
        {JSON.stringify(throttler.state, null, 2)}
      </pre>
    </div>
  )
}

function App3() {
  const [instantExecutionCount, setInstantExecutionCount] = useState(0)
  const [currentValue, setCurrentValue] = useState(50)

  // higher-level hook that uses React.useState with the state setter automatically throttled
  const [throttledValue, setThrottledValue, throttler] = useThrottledState(
    currentValue,
    {
      wait: 250,
    },
  )

  function handleRangeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newValue = parseInt(e.target.value, 10)
    setCurrentValue(newValue)
    setThrottledValue(newValue)
    setInstantExecutionCount((c) => c + 1)
  }

  return (
    <div>
      <h1>TanStack Pacer useThrottledState Example 3</h1>
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
          Throttled Range (Readonly):
          <input
            type="range"
            min="0"
            max="100"
            value={throttledValue}
            readOnly
            style={{ width: '100%' }}
          />
          <span>{throttledValue}</span>
        </label>
      </div>
      <table>
        <tbody>
          <tr>
            <td>Instant Execution Count:</td>
            <td>{instantExecutionCount}</td>
          </tr>
          <tr>
            <td>Throttled Execution Count:</td>
            <td>{throttler.state.executionCount}</td>
          </tr>
          <tr>
            <td>Saved Executions:</td>
            <td>
              {instantExecutionCount - throttler.state.executionCount} (
              {instantExecutionCount > 0
                ? (
                    ((instantExecutionCount - throttler.state.executionCount) /
                      instantExecutionCount) *
                    100
                  ).toFixed(2)
                : 0}
              % Reduction in execution calls)
            </td>
          </tr>
        </tbody>
      </table>
      <div style={{ color: '#666', fontSize: '0.9em' }}>
        <p>Throttled to 1 update per 250ms</p>
      </div>
      <pre style={{ marginTop: '20px' }}>
        {JSON.stringify(throttler.state, null, 2)}
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
