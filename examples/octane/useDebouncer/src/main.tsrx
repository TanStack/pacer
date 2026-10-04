import { createRoot, useRef, useState, useLayoutEffect } from 'octane'
import { useDebouncer, PacerProvider } from '@tanstack/octane-pacer'
import { TanStackDevtoolsCore } from '@tanstack/devtools'
import { pacerDevtoolsPlugin } from '@tanstack/pacer-devtools'

function App1() @{
  // Use your state management library of choice
  const [instantCount, setInstantCount] = useState(0)
  const instantCountRef = useRef(0)
  const [debouncedCount, setDebouncedCount] = useState(0)

  // Lower-level useDebouncer hook - requires you to manage your own state
  const debouncer = useDebouncer(
    setDebouncedCount,
    {
      key: 'counter',
      wait: 800,
      enabled: () => instantCountRef.current > 2, // optional, defaults to true
      // leading: true, // optional, defaults to false
    },
    // Alternative to debouncer.Subscribe: pass a selector as 3rd arg to cause re-renders and subscribe to state
    // (state) => state,
  )

  function increment() {
    const nextCount = ++instantCountRef.current
    setInstantCount(nextCount)
    debouncer.maybeExecute(nextCount)
  }

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
      <button onClick={() => debouncer.flush()} style={{ marginLeft: '10px' }}>
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
}

function App2() @{
  const [searchText, setSearchText] = useState('')
  const searchTextRef = useRef('')
  const [debouncedSearchText, setDebouncedSearchText] = useState('')

  // Lower-level useDebouncer hook - requires you to manage your own state
  const setSearchDebouncer = useDebouncer(
    setDebouncedSearchText,
    {
      key: 'search',
      wait: 500,
      enabled: () => searchTextRef.current.length > 2, // optional, defaults to true
    },
    // Alternative to setSearchDebouncer.Subscribe: pass a selector as 3rd arg to cause re-renders and subscribe to state
    // (state) => state,
  )

  function handleSearchChange(e: Event) {
    const newValue = (e.target as HTMLInputElement).value
    searchTextRef.current = newValue
    setSearchText(newValue)
    setSearchDebouncer.maybeExecute(newValue)
  }

  <div>
    <h1>TanStack Pacer useDebouncer Example 2</h1>
    <div>
      <input
        autoFocus
        type="search"
        value={searchText}
        onInput={handleSearchChange}
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
}

function App3() @{
  const [currentValue, setCurrentValue] = useState(50)
  const [debouncedValue, setDebouncedValue] = useState(50)
  const [instantExecutionCount, setInstantExecutionCount] = useState(0)
  const [wait, setWait] = useState(250)
  const [enabled, setEnabled] = useState(true)

  // Lower-level useDebouncer hook - requires you to manage your own state
  const setValueDebouncer = useDebouncer(
    setDebouncedValue,
    {
      key: 'range',
      wait,
      enabled,
    },
    // Alternative to setValueDebouncer.Subscribe: pass a selector as 3rd arg to cause re-renders and subscribe to state
    // (state) => state,
  )

  function handleRangeChange(e: Event) {
    const newValue = parseInt((e.target as HTMLInputElement).value, 10)
    setCurrentValue(newValue)
    setInstantExecutionCount((c) => c + 1)
    setValueDebouncer.maybeExecute(newValue)
  }

  <div>
    <h1>TanStack Pacer useDebouncer Example 3</h1>
    <fieldset>
      <legend>Reactive options</legend>
      <label>
        Delay: {wait}
        {' ms'}
        <input
          type="range"
          min="0"
          max="1500"
          step="50"
          value={wait}
          onInput={(event) =>
            setWait((event.currentTarget as HTMLInputElement).valueAsNumber)
          }
        />
      </label>
      <label>
        <input
          type="checkbox"
          checked={enabled}
          onInput={(event) =>
            setEnabled((event.currentTarget as HTMLInputElement).checked)
          }
        />
        {'Enabled'}
      </label>
      <p>
        Changing the delay affects the next scheduled call. Disabling cancels
        pending work.
      </p>
    </fieldset>
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
        {'Debounced Range (Readonly):'}
        <input
          type="range"
          min="0"
          max="100"
          value={debouncedValue}
          disabled
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
                  {'%'}
                </td>
              </tr>
            </>
          )}
        </setValueDebouncer.Subscribe>
      </tbody>
    </table>
    <div style={{ color: '#666', fontSize: '0.9em' }}>
      <p>Debounced to {wait}ms wait time</p>
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
}

function App() @{
  useLayoutEffect(() => {
    if (!import.meta.env.DEV) return
    const target = document.createElement('div')
    document.body.append(target)
    const devtools = new TanStackDevtoolsCore({
      plugins: [pacerDevtoolsPlugin()],
    })
    devtools.mount(target)
    return () => {
      devtools.unmount()
      target.remove()
    }
  }, [])
  // Keep application events inside Octane's root. The devtools host uses
  // Solid's document-level delegation, which uses the same DOM handler keys.
  <div
    onClick={(event) => event.stopPropagation()}
    onInput={(event) => event.stopPropagation()}
  >
    <PacerProvider>
      <App1 />
      <hr />
      <App2 />
      <hr />
      <App3 />
    </PacerProvider>
  </div>
}
createRoot(document.getElementById('app')!).render(App)
