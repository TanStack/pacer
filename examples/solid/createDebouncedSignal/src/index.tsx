import { createSignal } from 'solid-js'
import { render } from 'solid-js/web'
import { createDebouncedSignal } from '@tanstack/solid-pacer/debouncer'

function App1() {
  const [instantCount, setInstantCount] = createSignal(0)

  // higher-level hook that uses Solid.createSignal with the state setter automatically debounced
  // optionally, grab the debouncer from the last index of the returned array
  const [debouncedCount, setDebouncedCount, debouncer] = createDebouncedSignal(
    instantCount(),
    {
      wait: 500,
      // enabled: () => instantCount() > 2, // optional, defaults to true
      // leading: true, // optional, defaults to false
    },
    // Alternative to debouncer.Subscribe: pass a selector as 3rd arg to track state and subscribe to updates
    // (state) => ({
    //   executionCount: state.executionCount,
    // }),
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
      <h1>TanStack Pacer createDebouncedSignal Example 1</h1>
      <table>
        <tbody>
          <debouncer.Subscribe
            selector={(state) => ({
              executionCount: state.executionCount,
            })}
          >
            {(state) => (
              <tr>
                <td>Execution Count:</td>
                <td>{state().executionCount}</td>
              </tr>
            )}
          </debouncer.Subscribe>
          <tr>
            <td colSpan={2}>
              <hr />
            </td>
          </tr>
          <tr>
            <td>Instant Count:</td>
            <td>{instantCount()}</td>
          </tr>
          <tr>
            <td>Debounced Count:</td>
            <td>{debouncedCount()}</td>
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
  const [instantSearch, setInstantSearch] = createSignal('')

  // higher-level hook that uses Solid.createSignal with the state setter automatically debounced
  const [debouncedSearch, setDebouncedSearch, debouncer] =
    createDebouncedSignal(
      instantSearch(),
      {
        wait: 500,
      },
      // Alternative to debouncer.Subscribe: pass a selector as 3rd arg to track state and subscribe to updates
      // (state) => ({
      //   executionCount: state.executionCount,
      // }),
    )

  function handleSearchChange(e: Event) {
    const target = e.target as HTMLInputElement
    const newValue = target.value
    setInstantSearch(newValue)
    setDebouncedSearch(newValue)
  }

  return (
    <div>
      <h1>TanStack Pacer createDebouncedSignal Example 2</h1>
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
          <debouncer.Subscribe
            selector={(state) => ({
              executionCount: state.executionCount,
            })}
          >
            {(state) => (
              <tr>
                <td>Execution Count:</td>
                <td>{state().executionCount}</td>
              </tr>
            )}
          </debouncer.Subscribe>
          <tr>
            <td colSpan={2}>
              <hr />
            </td>
          </tr>
          <tr>
            <td>Instant Search:</td>
            <td>{instantSearch()}</td>
          </tr>
          <tr>
            <td>Debounced Search:</td>
            <td>{debouncedSearch()}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

function App3() {
  const [currentValue, setCurrentValue] = createSignal(50)
  const [instantExecutionCount, setInstantExecutionCount] = createSignal(0)

  // higher-level hook that uses Solid.createSignal with the state setter automatically debounced
  const [debouncedValue, setDebouncedValue, debouncer] = createDebouncedSignal(
    currentValue(),
    {
      wait: 250,
    },
    // Alternative to debouncer.Subscribe: pass a selector as 3rd arg to track state and subscribe to updates
    // (state) => ({
    //   executionCount: state.executionCount,
    // }),
  )

  function handleRangeChange(e: Event) {
    const target = e.target as HTMLInputElement
    const newValue = parseInt(target.value, 10)
    setCurrentValue(newValue)
    setInstantExecutionCount((c) => c + 1)
    setDebouncedValue(newValue)
  }

  return (
    <div>
      <h1>TanStack Pacer createDebouncedSignal Example 3</h1>
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
          Debounced Range (Readonly):
          <input
            type="range"
            min="0"
            max="100"
            value={debouncedValue()}
            readOnly
            style={{ width: '100%' }}
          />
          <span>{debouncedValue()}</span>
        </label>
      </div>
      <table>
        <tbody>
          <tr>
            <td>Instant Executions:</td>
            <td>{instantExecutionCount()}</td>
          </tr>
          <debouncer.Subscribe
            selector={(state) => ({
              executionCount: state.executionCount,
            })}
          >
            {(state) => (
              <>
                <tr>
                  <td>Debounced Executions:</td>
                  <td>{state().executionCount}</td>
                </tr>
                <tr>
                  <td>Saved Executions:</td>
                  <td>{instantExecutionCount() - state().executionCount}</td>
                </tr>
                <tr>
                  <td>% Reduction:</td>
                  <td>
                    {instantExecutionCount() === 0
                      ? '0'
                      : Math.round(
                          ((instantExecutionCount() - state().executionCount) /
                            instantExecutionCount()) *
                            100,
                        )}
                    %
                  </td>
                </tr>
              </>
            )}
          </debouncer.Subscribe>
        </tbody>
      </table>
      <div style={{ color: '#666', 'font-size': '0.9em' }}>
        <p>Debounced with 250ms wait time</p>
      </div>
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
