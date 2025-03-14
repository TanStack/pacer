import { scan } from 'react-scan' // dev-tools for demo
import { useState } from 'react'
import ReactDOM from 'react-dom/client'
import { useDebouncedState } from '@tanstack/react-bouncer/debouncer'

function App() {
  const [instantCount, setInstantCount] = useState(0)

  // higher-level hook that uses React.useState with the state setter automatically debounced
  const [debouncedCount, setDebouncedCount] = useDebouncedState(instantCount, {
    wait: 500,
  })

  function increment() {
    // this pattern helps avoid common bugs with stale closures and state
    setInstantCount((c) => {
      const newInstantCount = c + 1 // common new value for both
      setDebouncedCount(newInstantCount) // debounced state update
      return newInstantCount // instant state update
    })
  }

  return (
    <div>
      <h1>TanStack Bouncer useDebouncedState Example</h1>
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
