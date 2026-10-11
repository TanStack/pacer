import { useState } from 'octane'
import { createRoot } from 'octane'
import { useThrottledValue } from '@tanstack/octane-pacer/throttler'

function App1() {
  const [instantCount, setInstantCount] = useState(0)

  function increment() {
    setInstantCount((c) => c + 1)
  }

  // highest-level hook that watches an instant local state value and returns a throttled value
  // optionally, grab the throttler from the last index of the returned array
  const [throttledCount] = useThrottledValue(
    instantCount,
    {
      wait: 1000,
      // enabled: () => instantCount > 2, // optional, defaults to true
    },
    // Alternative to throttler.Subscribe: pass a selector as 3rd arg to cause re-renders and subscribe to state
    // (state) => state,
  )

  return (
    <div>
      <h1>{'TanStack Pacer useThrottledValue Example 1'}</h1>
      <table>
        <tbody>
          <tr>
            <td>{'Instant Count:'}</td>
            <td>{instantCount}</td>
          </tr>
          <tr>
            <td>{'Throttled Count:'}</td>
            <td>{throttledCount}</td>
          </tr>
        </tbody>
      </table>
      <div>
        <button onClick={increment}>{'Increment'}</button>
      </div>
    </div>
  )
}

function App2() {
  const [instantSearch, setInstantSearch] = useState('')

  // highest-level hook that watches an instant local state value and returns a throttled value
  const [throttledSearch] = useThrottledValue(
    instantSearch,
    {
      wait: 1000,
      // enabled: instantSearch.length > 2, // optional, defaults to true
    },
    // Alternative to throttler.Subscribe: pass a selector as 3rd arg to cause re-renders and subscribe to state
    // (state) => state,
  )

  function handleSearchChange(e: Event & { currentTarget: HTMLInputElement }) {
    setInstantSearch(e.currentTarget.value)
  }

  return (
    <div>
      <h1>{'TanStack Pacer useThrottledValue Example 2'}</h1>
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
            <td>{'Instant Search:'}</td>
            <td>{instantSearch}</td>
          </tr>
          <tr>
            <td>{'Throttled Search:'}</td>
            <td>{throttledSearch}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

function App3() {
  const [submittedCount, setSubmittedCount] = useState(1)
  const [currentValue, setCurrentValue] = useState(50)

  // highest-level hook that watches an instant local state value and returns a throttled value
  const [throttledValue, throttler] = useThrottledValue(
    currentValue,
    {
      wait: 250,
    },
    // Alternative to throttler.Subscribe: pass a selector as 3rd arg to cause re-renders and subscribe to state
    // (state) => state,
  )

  function handleRangeChange(e: Event & { currentTarget: HTMLInputElement }) {
    const newValue = parseInt(e.currentTarget.value, 10)
    setCurrentValue(newValue)
    setSubmittedCount((c) => c + 1)
  }

  return (
    <div>
      <h1>{'TanStack Pacer useThrottledValue Example 3'}</h1>
      <div style={{ marginBottom: '20px' }}>
        <label>
          {'Current Range:'}
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
          {'Throttled Range (Readonly):'}
          <input
            type="range"
            min="0"
            max="100"
            value={throttledValue}
            disabled
            style={{ width: '100%' }}
          />
          <span>{throttledValue}</span>
        </label>
      </div>
      <throttler.Subscribe
        selector={(state) => ({
          executionCount: state.executionCount,
        })}
      >
        {({ executionCount }) => (
          <>
            <table>
              <tbody>
                <tr>
                  <td>{'Values Submitted:'}</td>
                  <td>{submittedCount}</td>
                </tr>
                <tr>
                  <td>{'Throttled Execution Count:'}</td>
                  <td>{executionCount}</td>
                </tr>
                <tr>
                  <td>{'Saved Executions:'}</td>
                  <td>
                    {submittedCount - executionCount}
                    {' ('}
                    {submittedCount > 0
                      ? (
                          ((submittedCount - executionCount) / submittedCount) *
                          100
                        ).toFixed(2)
                      : 0}
                    {'% Reduction in execution calls)'}
                  </td>
                </tr>
              </tbody>
            </table>
            <div style={{ color: '#666', fontSize: '0.9em' }}>
              <p>{'Throttled to 1 update per 250ms'}</p>
            </div>
          </>
        )}
      </throttler.Subscribe>
      <pre style={{ marginTop: '20px' }}>
        <throttler.Subscribe selector={(state) => state}>
          {(state) => JSON.stringify(state, null, 2)}
        </throttler.Subscribe>
      </pre>
    </div>
  )
}

function PacerExample() {
  return (
    <div>
      <App1 />
      <hr />
      <App2 />
      <hr />
      <App3 />
    </div>
  )
}
createRoot(document.getElementById('app')!).render(PacerExample)
