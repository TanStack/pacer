import { scan } from 'react-scan' // dev-tools for demo
import { useState } from 'react'
import ReactDOM from 'react-dom/client'
import { useRateLimitedValue } from '@tanstack/react-pacer/rate-limiter'

function App() {
  // Use your state management library of choice
  const [instantCount, setInstantCount] = useState(0)

  // Using useRateLimitedValue with a rate limit of 5 executions per 5 seconds
  const [limitedCount, rateLimiter] = useRateLimitedValue(instantCount, {
    limit: 5,
    window: 5000,
    onReject: (rejectionInfo) =>
      console.log('Rejected by rate limiter', rejectionInfo),
  })

  function increment() {
    // this pattern helps avoid common bugs with stale closures and state
    setInstantCount((c) => c + 1)
  }

  return (
    <div>
      <h1>TanStack Pacer useRateLimitedValue Example</h1>
      <div>Execution Count: {rateLimiter.getExecutionCount()}</div>
      <div>Rejection Count: {rateLimiter.getRejectionCount()}</div>
      <hr />
      <div>Instant Count: {instantCount}</div>
      <div>Rate Limited Count: {limitedCount}</div>
      <div>
        <button onClick={increment}>Increment</button>
        <button onClick={() => alert(rateLimiter.getRemainingInWindow())}>
          Remaining in Window
        </button>
        <button onClick={() => alert(rateLimiter.reset())}>Reset</button>
      </div>
    </div>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root')!)
root.render(<App />)

scan() // dev-tools for demo
