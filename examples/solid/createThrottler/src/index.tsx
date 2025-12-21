import { createSignal } from 'solid-js'
import { render } from 'solid-js/web'
import { createThrottler } from '@tanstack/solid-pacer/throttler'

function App1() {
  // Use your state management library of choice
  const [instantCount, setInstantCount] = createSignal(0)
  const [throttledCount, setThrottledCount] = createSignal(0)

  // Lower-level createThrottler hook - requires you to manage your own state
  const setCountThrottler = createThrottler(
    setThrottledCount,
    {
      wait: 1000,
      // leading: true, // default
      // trailing: true, // default
      // enabled: () => instantCount() > 2,
    },
    // Alternative to setCountThrottler.Subscribe: pass a selector as 3rd arg to track state and subscribe to updates
    // (state) => state,
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
      <h1>TanStack Pacer createThrottler Example 1</h1>
      <table>
        <tbody>
          <setCountThrottler.Subscribe
            selector={(state) => ({ executionCount: state.executionCount })}
          >
            {(state) => (
              <>
                <tr>
                  <td>Execution Count:</td>
                  <td>{state().executionCount}</td>
                </tr>
                <tr>
                  <td>Instant Count:</td>
                  <td>{instantCount()}</td>
                </tr>
                <tr>
                  <td>Throttled Count:</td>
                  <td>{throttledCount()}</td>
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
          style={{ 'margin-left': '10px' }}
        >
          Flush
        </button>
      </div>
      <setCountThrottler.Subscribe selector={(state) => state}>
        {(state) => (
          <pre style={{ 'margin-top': '20px' }}>
            {JSON.stringify(state, null, 2)}
          </pre>
        )}
      </setCountThrottler.Subscribe>
    </div>
  )
}

function App2() {
  const [instantSearch, setInstantSearch] = createSignal('')
  const [throttledSearch, setThrottledSearch] = createSignal('')

  // Lower-level createThrottler hook - requires you to manage your own state
  const setSearchThrottler = createThrottler(
    setThrottledSearch,
    {
      wait: 1000,
      enabled: instantSearch().length > 2,
    },
    // Alternative to setSearchThrottler.Subscribe: pass a selector as 3rd arg to cause re-renders and subscribe to state
    // (state) => state,
  )

  function handleSearchChange(e: Event) {
    const target = e.target as HTMLInputElement
    const newValue = target.value
    setInstantSearch(newValue)
    setSearchThrottler.maybeExecute(newValue)
  }

  return (
    <div>
      <h1>TanStack Pacer createThrottler Example 2</h1>
      <div>
        <input
          autofocus
          type="search"
          value={instantSearch()}
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
            {(state) => (
              <>
                <tr>
                  <td>Execution Count:</td>
                  <td>{state().executionCount}</td>
                </tr>
                <tr>
                  <td>Instant Search:</td>
                  <td>{instantSearch()}</td>
                </tr>
                <tr>
                  <td>Throttled Search:</td>
                  <td>{throttledSearch()}</td>
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
          <pre style={{ 'margin-top': '20px' }}>
            {JSON.stringify(state, null, 2)}
          </pre>
        )}
      </setSearchThrottler.Subscribe>
    </div>
  )
}

function App3() {
  const [currentValue, setCurrentValue] = createSignal(50)
  const [throttledValue, setThrottledValue] = createSignal(50)
  const [instantExecutionCount, setInstantExecutionCount] = createSignal(0)

  // Lower-level createThrottler hook - requires you to manage your own state
  const setValueThrottler = createThrottler(
    setThrottledValue,
    {
      wait: 250,
      // leading: true, // default
      // trailing: true, // default
    },
    // Alternative to setValueThrottler.Subscribe: pass a selector as 3rd arg to cause re-renders and subscribe to state
    // (state) => state,
  )

  function handleRangeChange(e: Event) {
    const target = e.target as HTMLInputElement
    const newValue = parseInt(target.value, 10)
    setCurrentValue(newValue)
    setInstantExecutionCount((c) => c + 1)
    setValueThrottler.maybeExecute(newValue)
  }

  return (
    <div>
      <h1>TanStack Pacer createThrottler Example 3</h1>
      <div style={{ 'margin-bottom': '20px' }}>
        <label>
          Current Range:
          <input
            type="range"
            min="0"
            max="100"
            value={currentValue()}
            onInput={handleRangeChange}
            style={{ width: '100%' }}
          />
          <span>{currentValue()}</span>
        </label>
      </div>
      <div style={{ 'margin-bottom': '20px' }}>
        <label>
          Throttled Range (Readonly):
          <input
            type="range"
            min="0"
            max="100"
            value={throttledValue()}
            readOnly
            style={{ width: '100%' }}
          />
          <span>{throttledValue()}</span>
        </label>
      </div>
      <table>
        <tbody>
          <setValueThrottler.Subscribe
            selector={(state) => ({ executionCount: state.executionCount })}
          >
            {(state) => (
              <>
                <tr>
                  <td>Instant Execution Count:</td>
                  <td>{instantExecutionCount()}</td>
                </tr>
                <tr>
                  <td>Throttled Execution Count:</td>
                  <td>{state().executionCount}</td>
                </tr>
                <tr>
                  <td>Saved Executions:</td>
                  <td>
                    {instantExecutionCount() - state().executionCount} (
                    {instantExecutionCount() > 0
                      ? (
                          ((instantExecutionCount() - state().executionCount) /
                            instantExecutionCount()) *
                          100
                        ).toFixed(2)
                      : 0}
                    % Reduction in execution calls)
                  </td>
                </tr>
              </>
            )}
          </setValueThrottler.Subscribe>
        </tbody>
      </table>
      <div style={{ color: '#666', 'font-size': '0.9em' }}>
        <p>Throttled to 1 update per 250ms (trailing edge)</p>
      </div>
      <div>
        <button onClick={() => setValueThrottler.flush()}>Flush</button>
      </div>
      <setValueThrottler.Subscribe selector={(state) => state}>
        {(state) => (
          <pre style={{ 'margin-top': '20px' }}>
            {JSON.stringify(state, null, 2)}
          </pre>
        )}
      </setValueThrottler.Subscribe>
    </div>
  )
}

render(
  () => (
    <div>
      <App1 />
      <hr />
      <App2 />
      <hr />
      <App3 />
    </div>
  ),
  document.getElementById('root')!,
)
