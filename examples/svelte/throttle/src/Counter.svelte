<script lang="ts">
  import { throttle } from '@tanstack/svelte-pacer/throttler'

  let instantCount = $state(0)

  let throttledCount = $state(0)

  // Create throttled setter function - Stable reference required!
  const throttledSetCount = throttle(
    (value: typeof throttledCount) => (throttledCount = value),
    {
      wait: 1000,
    },
  )

  function increment() {
    // this pattern helps avoid common bugs with stale closures and state
    instantCount = ((c) => {
      const newInstantCount = c + 1 // common new value for both
      throttledSetCount(newInstantCount) // throttled state update
      return newInstantCount // instant state update
    })(instantCount)
  }
</script>

<div>
  <h1>TanStack Pacer throttle Example 1</h1>
  <table>
    <tbody
      ><tr><td>Instant Count:</td><td>{instantCount}</td></tr><tr
        ><td>Throttled Count:</td><td>{throttledCount}</td></tr
      ></tbody
    >
  </table>
  <div><button onclick={increment}>Increment</button></div>
</div>
