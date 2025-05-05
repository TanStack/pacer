import { createSignal } from 'solid-js'
import { render } from 'solid-js/web'
import { throttle } from '@tanstack/solid-pacer/throttler'

function App1() {
  // Use your state management library of choice
  const [instantCount, setInstantCount] = createSignal(0)
  const [throttledCount, setThrottledCount] = createSignal(0)

  // Create throttled setter function - Stable reference required!
  const throttledSetCount = throttle(setThrottledCount, {
    wait: 1000,
  })

  function increment() {
    // this pattern helps avoid common bugs with stale closures and state
    setInstantCount((c) => {
      const newInstantCount = c + 1 // common new value for both
      throttledSetCount(newInstantCount) // throttled state update
      return newInstantCount // instant state update
    })
  }

  return (
    <div>
      <h1>TanStack Pacer throttle Example 1</h1>
      <table>
        <tbody>
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
  const [text, setText] = createSignal('')
  const [throttledText, setThrottledText] = createSignal('')

  // Create throttled setter function - Stable reference required!
  const throttledSetText = throttle(setThrottledText, {
    wait: 1000,
  })

  function handleTextChange(e: Event) {
    const target = e.target as HTMLInputElement
    const newValue = target.value
    setText(newValue)
    throttledSetText(newValue)
  }

  return (
    <div>
      <h1>TanStack Pacer throttle Example 2</h1>
      <div>
        <input
          autofocus
          type="search"
          value={text()}
          onInput={handleTextChange}
          placeholder="Type text (throttled to 1 update per second)..."
          style={{ width: '100%' }}
        />
      </div>
      <table>
        <tbody>
          <tr>
            <td>Instant Text:</td>
            <td>{text()}</td>
          </tr>
          <tr>
            <td>Throttled Text:</td>
            <td>{throttledText()}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

render(
  () => (
    <div>
      <App1 />
      <hr />
      <App2 />
    </div>
  ),
  document.getElementById('root')!,
)
