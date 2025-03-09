import { scan } from 'react-scan' // dev-tools for demo
import { useState } from 'react'
import ReactDOM from 'react-dom/client'
import { useDebouncedValue } from '@tanstack/react-bouncer'

function App() {
  const [instantCount, setInstantCount] = useState(0)

  function increment() {
    setInstantCount((c) => c + 1)
  }

  // wrapper around useDebouncer, useState, and useEffect that watches instantCount and debounces it
  const [debouncedCount] = useDebouncedValue(instantCount, {
    wait: 500,
  })

  return (
    <div>
      <h1>TanStack Bouncer useDebouncedValue Example</h1>
      <div>Instant Count: {instantCount}</div>
      <div>Debounced Count: {debouncedCount}</div>
      <div>
        <button onClick={increment}>Increment</button>
      </div>
    </div>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root')!)
root.render(<App />)

scan() // dev-tools for demo
