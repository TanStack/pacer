import { useState } from 'preact/hooks'
import { render } from 'preact'
import type { JSX } from 'preact'
import { useThrottledState } from '@tanstack/preact-pacer/throttler'

function App1() {
  const [instantCount, setInstantCount] = useState(0)

  // higher-level hook that uses Preact.useState with the state setter automatically throttled
  // optionally, grab the throttler from the last index of the returned array
  const [throttledCount, setThrottledCount, throttler] = useThrottledState(
    instantCount,
    {
      wait: 1000,
      // enabled: () => instantCount > 2, // optional, defaults to true
      // Alternative to throttler.Subscribe: pass a selector as 3rd arg to cause re-renders and subscribe to state
      // (state) => state,
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
          <throttler.Subscribe
            selector={(state) => ({ executionCount: state.executionCount })}
          >
            {({ executionCount }) => (
              <>
                <tr>
                  <td>Execution Count:</td>
                  <td>{executionCount}</td>
                </tr>
                <tr>
                  <td>Instant Count:</td>
                  <td>{instantCount}</td>
                </tr>
                <tr>
                  <td>Throttled Count:</td>
                  <td>{throttledCount}</td>
                </tr>
              </>
            )}
          </throttler.Subscribe>
        </tbody>
      </table>
      <div>
        <button onClick={increment}>Increment</button>
      </div>
      <throttler.Subscribe selector={(state) => state}>
        {(state) => (
          <pre style={{ marginTop: '20px' }}>
            {JSON.stringify(state, null, 2)}
          </pre>
        )}
      </throttler.Subscribe>
    </div>
  )
}

function App2() {
  const [instantSearch, setInstantSearch] = useState('')

  // higher-level hook that uses Preact.useState with the state setter automatically throttled
  const [throttledSearch, setThrottledSearch, throttler] = useThrottledState(
    instantSearch,
    {
      wait: 1000,
      // enabled: instantSearch.length > 2, // optional, defaults to true
      // Alternative to throttler.Subscribe: pass a selector as 3rd arg to cause re-renders and subscribe to state
      // (state) => state,
    },
  )

  function handleSearchChange(e: JSX.TargetedEvent<HTMLInputElement>) {
    const newValue = e.currentTarget.value
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
          onInput={handleSearchChange}
          placeholder="Type to search..."
          style={{ width: '100%' }}
        />
      </div>
      <table>
        <tbody>
          <throttler.Subscribe
            selector={(state) => ({ executionCount: state.executionCount })}
          >
            {({ executionCount }) => (
              <>
                <tr>
                  <td>Execution Count:</td>
                  <td>{executionCount}</td>
                </tr>
                <tr>
                  <td>Instant Search:</td>
                  <td>{instantSearch}</td>
                </tr>
                <tr>
                  <td>Throttled Search:</td>
                  <td>{throttledSearch}</td>
                </tr>
              </>
            )}
          </throttler.Subscribe>
        </tbody>
      </table>
      <throttler.Subscribe selector={(state) => state}>
        {(state) => (
          <pre style={{ marginTop: '20px' }}>
            {JSON.stringify(state, null, 2)}
          </pre>
        )}
      </throttler.Subscribe>
    </div>
  )
}

function App3() {
  const [instantExecutionCount, setInstantExecutionCount] = useState(0)
  const [currentValue, setCurrentValue] = useState(50)

  // higher-level hook that uses Preact.useState with the state setter automatically throttled
  const [throttledValue, setThrottledValue, throttler] = useThrottledState(
    currentValue,
    {
      wait: 250,
      // Alternative to throttler.Subscribe: pass a selector as 3rd arg to cause re-renders and subscribe to state
      // (state) => state,
    },
  )

  function handleRangeChange(e: JSX.TargetedEvent<HTMLInputElement>) {
    const newValue = parseInt(e.currentTarget.value, 10)
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
          <throttler.Subscribe
            selector={(state) => ({ executionCount: state.executionCount })}
          >
            {({ executionCount }) => (
              <>
                <tr>
                  <td>Instant Execution Count:</td>
                  <td>{instantExecutionCount}</td>
                </tr>
                <tr>
                  <td>Throttled Execution Count:</td>
                  <td>{executionCount}</td>
                </tr>
                <tr>
                  <td>Saved Executions:</td>
                  <td>
                    {instantExecutionCount - executionCount} (
                    {instantExecutionCount > 0
                      ? (
                          ((instantExecutionCount - executionCount) /
                            instantExecutionCount) *
                          100
                        ).toFixed(2)
                      : 0}
                    % Reduction in execution calls)
                  </td>
                </tr>
              </>
            )}
          </throttler.Subscribe>
        </tbody>
      </table>
      <div style={{ color: '#666', fontSize: '0.9em' }}>
        <p>Throttled to 1 update per 250ms</p>
      </div>
      <throttler.Subscribe selector={(state) => state}>
        {(state) => (
          <pre style={{ marginTop: '20px' }}>
            {JSON.stringify(state, null, 2)}
          </pre>
        )}
      </throttler.Subscribe>
    </div>
  )
}

const root = document.getElementById('root')!
render(
  <div>
    <App1 />
    <hr />
    <App2 />
    <hr />
    <App3 />
  </div>,
  root,
)
