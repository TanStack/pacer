import { scan } from 'react-scan' // dev-tools for demo
import { useState } from 'react'
import ReactDOM from 'react-dom/client'
import { useThrottledState } from '@tanstack/react-bouncer'

function App() {
  const [instantCount, setInstantCount] = useState(0)

  // wrapper around useThrottler and useState
  const [throttledCount, setThrottledCount] = useThrottledState(instantCount, {
    wait: 1000,
  })

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
      <h1>TanStack Bouncer useThrottledState Example</h1>
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
