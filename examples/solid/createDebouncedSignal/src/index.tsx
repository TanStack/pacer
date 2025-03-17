import { createSignal } from 'solid-js'
import { render } from 'solid-js/web'
import { createDebouncedSignal } from '@tanstack/solid-pacer/debouncer'

function App() {
  // Use your state management library of choice
  const [instantCount, setInstantCount] = createSignal(0)

  // Lower-level createDebouncer - requires you to manage your own state
  const [debouncedCount, setDebouncedCount, debouncer] = createDebouncedSignal(
    0,
    {
      wait: 500,
    },
  )

  function increment() {
    // this pattern helps avoid common bugs with stale closures and state
    setInstantCount((c) => {
      const newInstantCount = c + 1 // common new value for both
      setDebouncedCount(() => newInstantCount) // debounced state update
      return newInstantCount // instant state update
    })
  }

  return (
    <div>
      <h1>TanStack Pacer createDebouncedSignal Example</h1>
      <div>Execution Count: {debouncer.getExecutionCount()}</div>
      <hr />
      <div>Instant Count: {instantCount()}</div>
      <div>Debounced Count: {debouncedCount()}</div>
      <div>
        <button onClick={increment}>Increment</button>
      </div>
    </div>
  )
}

render(() => <App />, document.getElementById('root')!)
