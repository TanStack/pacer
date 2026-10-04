<script lang="ts">
  import { createThrottler } from '@tanstack/svelte-pacer/throttler'

  let instantCount = $state(0)

  let instantCountRef = $state(0)

  let throttledCount = $state(0)

  const throttledSetCount = createThrottler(
    (value: typeof throttledCount) => {
      throttledCount = value
    },
    () => ({
      wait: 1000,
      enabled: () => instantCountRef > 2,
    }),
  ).maybeExecute

  function increment() {
    const nextCount = ++instantCountRef
    instantCount = nextCount
    throttledSetCount(nextCount)
  }
</script>

<div>
  <h1>TanStack Pacer createThrottler Example 1</h1>
  <table>
    <tbody
      ><tr><td>Instant Count:</td><td>{instantCount}</td></tr><tr
        ><td>Throttled Count:</td><td>{throttledCount}</td></tr
      ></tbody
    >
  </table>
  <div><button onclick={increment}>Increment</button></div>
</div>
