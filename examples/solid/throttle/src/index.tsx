import { createSignal } from 'solid-js'
import { render } from 'solid-js/web'
import { throttle } from '@tanstack/solid-bouncer/throttler'

function App() {
  const [instantCount, setInstantCount] = createSignal(0)
  const [throttledCount, setThrottledCount] = createSignal(0)

  // Create throttled setter function
  const throttledSetCount = throttle(
    (value: number) => {
      setThrottledCount(value)
    },
    {
      wait: 1000,
    },
  )

  function increment() {
    // this pattern helps avoid common bugs with stale closures and state
    const newInstantCount = instantCount() + 1 // common new value for both
    setInstantCount(newInstantCount) // instant state update
    throttledSetCount(newInstantCount) // throttled state update
  }

  return (
    <div>
      <h1>Solid Bouncer throttle Example</h1>
      <div>Instant Count: {instantCount()}</div>
      <div>Throttled Count: {throttledCount()}</div>
      <div>
        <button onClick={increment}>Increment</button>
      </div>
    </div>
  )
}

render(() => <App />, document.getElementById('root')!)
