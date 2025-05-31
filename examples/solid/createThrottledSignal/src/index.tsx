import { createSignal } from 'solid-js'
import { render } from 'solid-js/web'
import { createThrottledSignal } from '@tanstack/solid-pacer/throttler'

function App1() {
  const [instantCount, setInstantCount] = createSignal(0)

  // higher-level hook that uses Solid.createSignal with the state setter automatically throttled
  // optionally, grab the throttler from the last index of the returned array
  const [throttledCount, setThrottledCount, throttler] = createThrottledSignal(
    instantCount(),
    {
      wait: 1000,
      // enabled: () => instantCount() > 2, // optional, defaults to true
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
      <h1>TanStack Pacer createThrottledSignal Example 1</h1>
      <table>
        <tbody>
          <tr>
            <td>Execution Count:</td>
            <td>{throttler.executionCount()}</td>
          </tr>
          <tr>
            <td>Instant Count:</td>
            <td>{instantCount()}</td>
          </tr>
          <tr>
            <td>Throttled Count:</td>
            <td>{throttledCount()}</td>
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

  // higher-level hook that uses React.createSignal with the state setter automatically throttled
  const [throttledSearch, setThrottledSearch, throttler] =
    createThrottledSignal(instantSearch(), {
      wait: 1000,
      // enabled: () => instantSearch().length > 2, // optional, defaults to true
    })

  function handleSearchChange(e: Event) {
    const target = e.target as HTMLInputElement
    const newValue = target.value
    setInstantSearch(newValue)
    setThrottledSearch(newValue)
  }

  return (
    <div>
      <h1>TanStack Pacer createThrottledSignal Example 2</h1>
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
            <td>Execution Count:</td>
            <td>{throttler.executionCount()}</td>
          </tr>
          <tr>
            <td>Instant Search:</td>
            <td>{instantSearch()}</td>
          </tr>
          <tr>
            <td>Throttled Search:</td>
            <td>{throttledSearch()}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

function App3() {
  const [currentValue, setCurrentValue] = createSignal(50)
  const [instantExecutionCount, setInstantExecutionCount] = createSignal(0)

  // higher-level hook that uses Solid.createSignal with the state setter automatically throttled
  const [throttledValue, setThrottledValue, throttler] = createThrottledSignal(
    currentValue(),
    {
      wait: 250,
    },
  )

  function handleRangeChange(e: Event) {
    const target = e.target as HTMLInputElement
    const newValue = parseInt(target.value, 10)
    setCurrentValue(newValue)
    setInstantExecutionCount((c) => c + 1)
    setThrottledValue(newValue)
  }

  return (
    <div>
      <h1>TanStack Pacer createThrottledSignal Example 3</h1>
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
          <tr>
            <td>Instant Executions:</td>
            <td>{instantExecutionCount()}</td>
          </tr>
          <tr>
            <td>Throttled Executions:</td>
            <td>{throttler.executionCount()}</td>
          </tr>
          <tr>
            <td>Saved Executions:</td>
            <td>{instantExecutionCount() - throttler.executionCount()}</td>
          </tr>
          <tr>
            <td>% Reduction:</td>
            <td>
              {instantExecutionCount() === 0
                ? '0'
                : Math.round(
                    ((instantExecutionCount() - throttler.executionCount()) /
                      instantExecutionCount()) *
                      100,
                  )}
              %
            </td>
          </tr>
        </tbody>
      </table>
      <div style={{ color: '#666', 'font-size': '0.9em' }}>
        <p>Throttled with 250ms wait time</p>
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
