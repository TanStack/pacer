import { useState } from 'preact/hooks'
import { render } from 'preact'
import type { JSX } from 'preact'
import { useThrottler } from '@tanstack/preact-pacer/throttler'
import { PacerProvider } from '@tanstack/preact-pacer/provider'

function App1() {
  // Use your state management library of choice
  const [instantCount, setInstantCount] = useState(0)
  const [throttledCount, setThrottledCount] = useState(0)

  // Lower-level useThrottler hook - requires you to manage your own state
  const setCountThrottler = useThrottler(
    setThrottledCount,
    {
      wait: 1000,
      // leading: true, // default
      // trailing: true, // default
      // enabled: () => instantCount > 2,
    },
    // Optional Selector function to pick the state you want to track and use
    (state) => ({ executionCount: state.executionCount }),
  )

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
            <td>{setCountThrottler.state.executionCount}</td>
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
        <button
          onClick={() => setCountThrottler.flush()}
          style={{ marginLeft: '10px' }}
        >
          Flush
        </button>
      </div>
      <pre style={{ marginTop: '20px' }}>
        {JSON.stringify(setCountThrottler.store.state, null, 2)}
      </pre>
    </div>
  )
}

function App2() {
  const [instantSearch, setInstantSearch] = useState('')
  const [throttledSearch, setThrottledSearch] = useState('')

  // Lower-level useThrottler hook - requires you to manage your own state
  const setSearchThrottler = useThrottler(
    setThrottledSearch,
    {
      wait: 1000,
      enabled: instantSearch.length > 2,
    },
    // Optional Selector function to pick the state you want to track and use

    (state) => ({ executionCount: state.executionCount }),
  )

  function handleSearchChange(e: JSX.TargetedEvent<HTMLInputElement>) {
    const newValue = e.currentTarget.value
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
          onInput={handleSearchChange}
          placeholder="Type to search..."
          style={{ width: '100%' }}
        />
      </div>
      <table>
        <tbody>
          <tr>
            <td>Execution Count:</td>
            <td>{setSearchThrottler.state.executionCount}</td>
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
      <div>
        <button onClick={() => setSearchThrottler.flush()}>Flush</button>
      </div>
      <pre style={{ marginTop: '20px' }}>
        {JSON.stringify(setSearchThrottler.store.state, null, 2)}
      </pre>
    </div>
  )
}

function App3() {
  const [instantExecutionCount, setInstantExecutionCount] = useState(0)
  const [currentValue, setCurrentValue] = useState(50)
  const [throttledValue, setThrottledValue] = useState(50)

  // Lower-level useThrottler hook - requires you to manage your own state
  const setValueThrottler = useThrottler(
    setThrottledValue,
    {
      wait: 250,
      // leading: true, // default
      // trailing: true, // default
    },
    // Optional Selector function to pick the state you want to track and use
    (state) => ({ executionCount: state.executionCount }),
  )

  function handleRangeChange(e: JSX.TargetedEvent<HTMLInputElement>) {
    const newValue = parseInt(e.currentTarget.value, 10)

    // instant state update
    setCurrentValue(newValue)
    setInstantExecutionCount((c) => c + 1)

    // throttled state update
    setValueThrottler.maybeExecute(newValue)
  }

  return (
    <div>
      <h1>TanStack Pacer useThrottler Example 3</h1>
      <div style={{ marginBottom: '20px' }}>
        <label>
          Current Range:
          <input
            type="range"
            min="0"
            max="100"
            value={currentValue}
            onInput={handleRangeChange}
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
            <td>{setValueThrottler.state.executionCount}</td>
          </tr>
          <tr>
            <td>Saved Executions:</td>
            <td>
              {instantExecutionCount - setValueThrottler.state.executionCount} (
              {instantExecutionCount > 0
                ? (
                    ((instantExecutionCount -
                      setValueThrottler.state.executionCount) /
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
        <p>Throttled to 1 update per 250ms (trailing edge)</p>
      </div>
      <div>
        <button onClick={() => setValueThrottler.flush()}>Flush</button>
      </div>
      <pre style={{ marginTop: '20px' }}>
        {JSON.stringify(setValueThrottler.store.state, null, 2)}
      </pre>
    </div>
  )
}

const root = document.getElementById('root')!
render(
  // optionally, provide default options to an optional PacerProvider
  <PacerProvider
  // defaultOptions={{
  //   throttler: {
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
  </PacerProvider>,
  root,
)
