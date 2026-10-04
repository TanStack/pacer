<script lang="ts">
  import { untrack } from 'svelte'

  import { createThrottledSignal } from '@tanstack/svelte-pacer/throttler'

  let instantCount = $state(0)

  let instantCountRef = $state(0)

  const [throttledCount, setThrottledCount, throttler] = createThrottledSignal(
    untrack(() => instantCount),
    () => ({
      wait: 1000,
      // enabled: () => instantCount > 2, // optional, defaults to true
    }),
  )

  function increment() {
    const nextCount = ++instantCountRef
    instantCount = nextCount
    setThrottledCount(nextCount)
  }
</script>

<div>
  <h1>TanStack Pacer createThrottledSignal Example 1</h1>
  <table>
    <tbody
      ><throttler.Subscribe
        selector={(state) => ({ executionCount: state.executionCount })}
        >{#snippet children({ executionCount })}<tr
            ><td>Execution Count:</td><td>{executionCount}</td></tr
          ><tr><td>Instant Count:</td><td>{instantCount}</td></tr><tr
            ><td>Throttled Count:</td><td>{throttledCount()}</td></tr
          >{/snippet}</throttler.Subscribe
      ></tbody
    >
  </table>
  <div><button onclick={increment}>Increment</button></div>
  <throttler.Subscribe selector={(state) => state}
    >{#snippet children(state)}<pre style="margin-top: 20px">{JSON.stringify(
          state,
          null,
          2,
        )}</pre>{/snippet}</throttler.Subscribe
  >
</div>
