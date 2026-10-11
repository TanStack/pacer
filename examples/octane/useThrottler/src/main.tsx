import { createRoot, useLayoutEffect } from 'octane'
import { TanStackDevtoolsCore } from '@tanstack/devtools'
import { pacerDevtoolsPlugin } from '@tanstack/pacer-devtools'
import { useRef, useState } from 'octane'
import { useThrottler } from '@tanstack/octane-pacer/throttler'
import { PacerProvider } from '@tanstack/octane-pacer/provider'

function App1() {
  const [instantCount, setInstantCount] = useState(0)
  const instantCountRef = useRef(0)
  const [throttledCount, setThrottledCount] = useState(0)
  const setCountThrottler = useThrottler(
    setThrottledCount,
    {
      key: 'counter',
      wait: 1000,
      // leading: true, // default
      // trailing: true, // default
      // enabled: () => instantCountRef.current > 2,
    },
    // Alternative to setCountThrottler.Subscribe: pass a selector as 3rd arg to cause re-renders and subscribe to state
    // (state) => state,
  )
  function increment() {
    const nextCount = ++instantCountRef.current
    setInstantCount(nextCount)
    setCountThrottler.maybeExecute(nextCount)
  }
  return (
    <div>
      <h1>TanStack Pacer useThrottler Example 1</h1>
      <table>
        <tbody>
          <setCountThrottler.Subscribe
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
          </setCountThrottler.Subscribe>
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
      <setCountThrottler.Subscribe selector={(state) => state}>
        {(state) => (
          <pre style={{ marginTop: '20px' }}>
            {JSON.stringify(state, null, 2)}
          </pre>
        )}
      </setCountThrottler.Subscribe>
    </div>
  )
}

function App2() {
  const [instantSearch, setInstantSearch] = useState('')
  const instantSearchRef = useRef('')
  const [throttledSearch, setThrottledSearch] = useState('')
  const setSearchThrottler = useThrottler(
    setThrottledSearch,
    {
      key: 'search',
      wait: 1000,
      enabled: () => instantSearchRef.current.length > 2,
    },
    // Alternative to setSearchThrottler.Subscribe: pass a selector as 3rd arg to cause re-renders and subscribe to state
    // (state) => state,
  )
  function handleSearchChange(e: Event) {
    const newValue = (e.target as HTMLInputElement).value
    instantSearchRef.current = newValue
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
          <setSearchThrottler.Subscribe
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
          </setSearchThrottler.Subscribe>
        </tbody>
      </table>
      <div>
        <button onClick={() => setSearchThrottler.flush()}>Flush</button>
      </div>
      <setSearchThrottler.Subscribe selector={(state) => state}>
        {(state) => (
          <pre style={{ marginTop: '20px' }}>
            {JSON.stringify(state, null, 2)}
          </pre>
        )}
      </setSearchThrottler.Subscribe>
    </div>
  )
}

function App3() {
  const [instantExecutionCount, setInstantExecutionCount] = useState(0)
  const [currentValue, setCurrentValue] = useState(50)
  const [throttledValue, setThrottledValue] = useState(50)
  const setValueThrottler = useThrottler(
    setThrottledValue,
    {
      key: 'range',
      wait: 250,
      // leading: true, // default
      // trailing: true, // default
    },
    // Alternative to setValueThrottler.Subscribe: pass a selector as 3rd arg to cause re-renders and subscribe to state
    // (state) => state,
  )
  function handleRangeChange(e: Event) {
    const newValue = parseInt((e.target as HTMLInputElement).value, 10)

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
      <table>
        <tbody>
          <setValueThrottler.Subscribe
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
                    {instantExecutionCount - executionCount}
                    {' ('}
                    {instantExecutionCount > 0
                      ? (
                          ((instantExecutionCount - executionCount) /
                            instantExecutionCount) *
                          100
                        ).toFixed(2)
                      : 0}
                    {'% Reduction in execution calls)'}
                  </td>
                </tr>
              </>
            )}
          </setValueThrottler.Subscribe>
        </tbody>
      </table>
      <div style={{ color: '#666', fontSize: '0.9em' }}>
        <p>Throttled to 1 update per 250ms (trailing edge)</p>
      </div>
      <div>
        <button onClick={() => setValueThrottler.flush()}>Flush</button>
      </div>
      <setValueThrottler.Subscribe selector={(state) => state}>
        {(state) => (
          <pre style={{ marginTop: '20px' }}>
            {JSON.stringify(state, null, 2)}
          </pre>
        )}
      </setValueThrottler.Subscribe>
    </div>
  )
}

function PacerExample() {
  useLayoutEffect(() => {
    if (!import.meta.env.DEV) return
    const target = document.createElement('div')
    document.body.append(target)
    const host = new TanStackDevtoolsCore({ plugins: [pacerDevtoolsPlugin()] })
    host.mount(target)
    return () => {
      host.unmount()
      target.remove()
    }
  }, [])
  // Keep Solid's document-level devtools delegation outside Octane's application events.
  return (
    <div
      onClick={(event) => event.stopPropagation()}
      onInput={(event) => event.stopPropagation()}
    >
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
      </PacerProvider>
    </div>
  )
}
createRoot(document.getElementById('app')!).render(PacerExample)
