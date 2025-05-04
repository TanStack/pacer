import { useCallback, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { throttle } from '@tanstack/react-pacer/throttler'

function App1() {
  // Use your state management library of choice
  const [instantCount, setInstantCount] = useState(0)
  const [throttledCount, setThrottledCount] = useState(0)

  // Create throttled setter function - Stable reference required!
  const throttledSetCount = useCallback(
    throttle(setThrottledCount, {
      wait: 1000,
    }),
    [],
  )

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
      </div>
    </div>
  )
}

function App2() {
  const [text, setText] = useState('')
  const [throttledText, setThrottledText] = useState('')

  // Create throttled setter function - Stable reference required!
  const throttledSetText = useCallback(
    throttle(setThrottledText, {
      wait: 1000,
    }),
    [],
  )

  function handleTextChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newValue = e.target.value
    setText(newValue)
    throttledSetText(newValue)
  }

  return (
    <div>
      <h1>TanStack Pacer throttle Example 2</h1>
      <div>
        <input
          autoFocus
          type="search"
          value={text}
          onChange={handleTextChange}
          placeholder="Type text (throttled to 1 update per second)..."
          style={{ width: '100%' }}
        />
      </div>
      <table>
        <tbody>
          <tr>
            <td>Instant Text:</td>
            <td>{text}</td>
          </tr>
          <tr>
            <td>Throttled Text:</td>
            <td>{throttledText}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root')!)
root.render(
  <div>
    <App1 />
    <hr />
    <App2 />
  </div>,
)
