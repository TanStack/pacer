import { useState } from 'react'
import ReactDOM from 'react-dom/client'
import { useThrottledValue } from '@tanstack/react-pacer/throttler'

function App1() {
  const [instantCount, setInstantCount] = useState(0)

  function increment() {
    setInstantCount((c) => c + 1)
  }

  // highest-level hook that watches an instant local state value and returns a throttled value
  // optionally, grab the throttler from the last index of the returned array
  const [throttledCount] = useThrottledValue(instantCount, {
    wait: 1000,
    // enabled: () => instantCount > 2, // optional, defaults to true
  })

  return (
    <div>
      <h1>TanStack Pacer useThrottledValue Example 1</h1>
      <table>
        <tbody>
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

  // highest-level hook that watches an instant local state value and returns a throttled value
  const [throttledSearch] = useThrottledValue(instantSearch, {
    wait: 1000,
    // enabled: instantSearch.length > 2, // optional, defaults to true
  })

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInstantSearch(e.target.value)
  }

  return (
    <div>
      <h1>TanStack Pacer useThrottledValue Example 2</h1>
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
            <td>Throttled Search:</td>
            <td>{throttledSearch}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

function App3() {
  const [instantExecutionCount, setInstantExecutionCount] = useState(0)
  const [currentValue, setCurrentValue] = useState(50)

  // highest-level hook that watches an instant local state value and returns a throttled value
  const [throttledValue, throttler] = useThrottledValue(currentValue, {
    wait: 250,
  })

  function handleRangeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newValue = parseInt(e.target.value, 10)
    setCurrentValue(newValue)
    setInstantExecutionCount((c) => c + 1)
  }

  return (
    <div>
      <h1>TanStack Pacer useThrottledValue Example 3</h1>
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
            <td>{throttler.getExecutionCount()}</td>
          </tr>
          <tr>
            <td>Saved Executions:</td>
            <td>
              {instantExecutionCount - throttler.getExecutionCount()} (
              {instantExecutionCount > 0
                ? (
                    ((instantExecutionCount - throttler.getExecutionCount()) /
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
