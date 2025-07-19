import { createSignal } from 'solid-js'
import { render } from 'solid-js/web'
import { createDebouncedValue } from '@tanstack/solid-pacer/debouncer'

function App1() {
  const [instantCount, setInstantCount] = createSignal(0)

  function increment() {
    setInstantCount((c) => c + 1)
  }

  // highest-level hook that watches an instant local state value and returns a debounced value
  const [debouncedCount] = createDebouncedValue(instantCount, {
    wait: 500,
    // enabled: () => instantCount() > 2, // optional, defaults to true
    // leading: true, // optional, defaults to false
  })

  return (
    <div>
      <h1>TanStack Pacer createDebouncedValue Example 1</h1>
      <table>
        <tbody>
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

  // highest-level hook that watches an instant local state value and returns a debounced value
  const [debouncedSearch] = createDebouncedValue(instantSearch, {
    wait: 500,
    // enabled: () => instantSearch().length > 2, // optional, defaults to true
  })

  function handleSearchChange(e: Event) {
    setInstantSearch((e.target as HTMLInputElement).value)
  }

  return (
    <div>
      <h1>TanStack Pacer createDebouncedValue Example 2</h1>
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

  // highest-level hook that watches an instant local state value and returns a debounced value
  const [debouncedValue, debouncer] = createDebouncedValue(
    currentValue,
    {
      wait: 250,
    },
    // Optional Selector function to pick the state you want to track and use
    (state) => ({
      executionCount: state.executionCount,
    }),
  )

  function handleRangeChange(e: Event) {
    const target = e.target as HTMLInputElement
    const newValue = parseInt(target.value, 10)
    setCurrentValue(newValue)
    setInstantExecutionCount((c) => c + 1)
  }

  return (
    <div>
      <h1>TanStack Pacer createDebouncedValue Example 3</h1>
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
          <tr>
            <td>Debounced Executions:</td>
            <td>{debouncer.state().executionCount}</td>
          </tr>
          <tr>
            <td>Saved Executions:</td>
            <td>
              {instantExecutionCount() - debouncer.state().executionCount}
            </td>
          </tr>
          <tr>
            <td>% Reduction:</td>
            <td>
              {instantExecutionCount() === 0
                ? '0'
                : Math.round(
                    ((instantExecutionCount() -
                      debouncer.state().executionCount) /
                      instantExecutionCount()) *
                      100,
                  )}
              %
            </td>
          </tr>
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
