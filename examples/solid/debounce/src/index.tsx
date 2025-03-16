import { createSignal } from 'solid-js'
import { render } from 'solid-js/web'
import { debounce } from '@tanstack/solid-pacer/debouncer'

function App() {
  // Use signals for state management
  const [instantCount, setInstantCount] = createSignal(0)
  const [debouncedCount, setDebouncedCount] = createSignal(0)

  // Create debounced setter function
  const debouncedSetCount = debounce(setDebouncedCount, {
    wait: 500,
  })

  function increment() {
    // Update both instant and debounced counts
    const newCount = instantCount() + 1
    setInstantCount(newCount)
    debouncedSetCount(newCount)
  }

  return (
    <div>
      <h1>TanStack Pacer debounce Example</h1>
      <div>Instant Count: {instantCount()}</div>
      <div>Debounced Count: {debouncedCount()}</div>
      <div>
        <button onClick={increment}>Increment</button>
      </div>
    </div>
  )
}

render(() => <App />, document.getElementById('root') as HTMLElement)
