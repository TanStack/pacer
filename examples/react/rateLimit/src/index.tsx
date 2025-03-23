import { scan } from 'react-scan' // dev-tools for demo
import { useCallback, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { rateLimit } from '@tanstack/react-pacer/rate-limiter'

function App() {
  // Use your state management library of choice
  const [instantCount, setInstantCount] = useState(0)
  const [rateLimitedCount, setRateLimitedCount] = useState(0)

  // Create rate-limited setter function - Stable reference required!
  const rateLimitedSetCount = useCallback(
    rateLimit(setRateLimitedCount, {
      limit: 3,
      window: 5000,
      onReject: (rejectionInfo) =>
        console.log('Rejected by rate limiter', rejectionInfo),
    }),
    [],
  )

  function increment() {
    // this pattern helps avoid common bugs with stale closures and state
    setInstantCount((c) => {
      const newInstantCount = c + 1 // common new value for both
      rateLimitedSetCount(newInstantCount) // rate-limited state update
      return newInstantCount // instant state update
    })
  }

  return (
    <div>
      <h1>TanStack Pacer rateLimit Example</h1>
      <div>Instant Count: {instantCount}</div>
      <div>Rate Limited Count: {rateLimitedCount}</div>
      <div>
        <button onClick={increment}>Increment</button>
      </div>
    </div>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root')!)
root.render(<App />)

scan() // dev-tools for demo
