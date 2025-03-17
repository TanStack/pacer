import { createSignal } from 'solid-js'
import { render } from 'solid-js/web'
import { createDebouncer } from '@tanstack/solid-pacer/debouncer'

function App() {
  // Use your state management library of choice
  const [instantCount, setInstantCount] = createSignal(0)
  const [debouncedCount, setDebouncedCount] = createSignal(0)

  // Lower-level createDebouncer - requires you to manage your own state
  const setCountDebouncer = createDebouncer(setDebouncedCount, {
    wait: 500,
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
      <h1>TanStack Pacer createDebouncer Example</h1>
      <div>Execution Count: {setCountDebouncer.getExecutionCount()}</div>
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
