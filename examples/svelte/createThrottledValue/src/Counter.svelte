<script lang="ts">
  import { createThrottledValue } from '@tanstack/svelte-pacer/throttler'

  let instantCount = $state(0)

  function increment() {
    instantCount = instantCount + 1
  }

  const [throttledCount] = createThrottledValue(
    () => instantCount,
    () => ({
      wait: 1000,
      // enabled: () => instantCount > 2, // optional, defaults to true
    }),
  )
</script>

<div>
  <h1>TanStack Pacer createThrottledValue Example 1</h1>
  <table>
    <tbody
      ><tr><td>Instant Count:</td><td>{instantCount}</td></tr><tr
        ><td>Throttled Count:</td><td>{throttledCount()}</td></tr
      ></tbody
    >
  </table>
  <div><button onclick={increment}>Increment</button></div>
</div>
