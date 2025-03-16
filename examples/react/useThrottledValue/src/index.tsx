import { scan } from 'react-scan' // dev-tools for demo
import { useState } from 'react'
import ReactDOM from 'react-dom/client'
import { useThrottledValue } from '@tanstack/react-pacer/throttler'

function App() {
  const [instantCount, setInstantCount] = useState(0)

  function increment() {
    setInstantCount((c) => c + 1)
  }

  // highest-level hook that watches an instant local state value and returns a throttled value
  // optionally, grab the throttler from the last index of the returned array
  const [throttledCount, throttler] = useThrottledValue(instantCount, {
    wait: 1000,
  })

  return (
    <div>
      <h1>TanStack Pacer useThrottledValue Example</h1>
      <div>Execution Count: {throttler.getExecutionCount()}</div>
      <hr />
      <div>Instant Count: {instantCount}</div>
      <div>Throttled Count: {throttledCount}</div>
      <div>
        <button onClick={increment}>Increment</button>
      </div>
    </div>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root')!)
root.render(<App />)

scan() // dev-tools for demo
