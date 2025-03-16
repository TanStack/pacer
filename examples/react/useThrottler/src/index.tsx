import { scan } from 'react-scan' // dev-tools for demo
import { useState } from 'react'
import ReactDOM from 'react-dom/client'
import { useThrottler } from '@tanstack/react-pacer/throttler'

function App() {
  // Use your state management library of choice
  const [instantCount, setInstantCount] = useState(0)
  const [throttledCount, setThrottledCount] = useState(0)

  // Lower-level useThrottler hook - requires you to manage your own state
  const setCountThrottler = useThrottler(setThrottledCount, {
    wait: 1000,
  })

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
      <h1>TanStack Pacer useThrottler Example</h1>
      <div>Execution Count: {setCountThrottler.getExecutionCount()}</div>
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
