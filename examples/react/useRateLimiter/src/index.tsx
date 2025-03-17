import { scan } from 'react-scan' // dev-tools for demo
import { useState } from 'react'
import ReactDOM from 'react-dom/client'
import { useRateLimiter } from '@tanstack/react-pacer/rate-limiter'

function App() {
  // Use your state management library of choice
  const [instantCount, setInstantCount] = useState(0)
  const [limitedCount, setLimitedCount] = useState(0)

  // Using useRateLimiter with a rate limit of 2 executions per second
  const setCountLimiter = useRateLimiter(setLimitedCount, {
    limit: 2,
    window: 1000,
  })

  function increment() {
    // this pattern helps avoid common bugs with stale closures and state
    setInstantCount((c) => {
      const newCount = c + 1 // common new value for both
      setCountLimiter.maybeExecute(newCount) // rate-limited state update
      return newCount // instant state update
    })
  }

  return (
    <div>
      <h1>TanStack Pacer useRateLimiter Example</h1>
      <div>Execution Count: {setCountLimiter.getExecutionCount()}</div>
      <div>Rejection Count: {setCountLimiter.getRejectionCount()}</div>
      <hr />
      <div>Instant Count: {instantCount}</div>
      <div>Rate Limited Count: {limitedCount}</div>
      <div>
        <button onClick={increment}>Increment</button>
      </div>
    </div>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root')!)
root.render(<App />)

scan() // dev-tools for demo
