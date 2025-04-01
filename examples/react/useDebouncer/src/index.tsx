import { scan } from 'react-scan' // dev-tools for demo
import { useState } from 'react'
import ReactDOM from 'react-dom/client'
import { useDebouncer } from '@tanstack/react-pacer/debouncer'

function App() {
  // Use your state management library of choice
  const [instantCount, setInstantCount] = useState(0)
  const [debouncedCount, setDebouncedCount] = useState(0)

  // Lower-level useDebouncer hook - requires you to manage your own state
  const setCountDebouncer = useDebouncer(setDebouncedCount, {
    wait: 500,
    enabled: instantCount > 2,
  })

  function increment() {
    // this pattern helps avoid common bugs with stale closures and state
    setInstantCount((c) => {
      const newInstantCount = c + 1 // common new value for both
      setCountDebouncer.maybeExecute(newInstantCount) // debounced state update
      return newInstantCount // instant state update
    })
  }

  return (
    <div>
      <h1>TanStack Pacer useDebouncer Example</h1>
      <div>Execution Count: {setCountDebouncer.getExecutionCount()}</div>
      <hr />
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
