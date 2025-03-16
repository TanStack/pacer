import { scan } from 'react-scan' // dev-tools for demo
import { useState } from 'react'
import ReactDOM from 'react-dom/client'
import { useThrottledState } from '@tanstack/react-pacer/throttler'

function App() {
  const [instantCount, setInstantCount] = useState(0)

  // higher-level hook that uses React.useState with the state setter automatically throttled
  // optionally, grab the throttler from the last index of the returned array
  const [throttledCount, setThrottledCount, throttler] = useThrottledState(
    instantCount,
    {
      wait: 1000,
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
      <h1>TanStack Pacer useThrottledState Example</h1>
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
