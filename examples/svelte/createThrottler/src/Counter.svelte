<script lang="ts">
  import { createThrottler } from '@tanstack/svelte-pacer/throttler'

  let instantCount = $state(0)

  let throttledCount = $state(0)

  const setCountThrottler = createThrottler(
    (value: typeof throttledCount) => {
      throttledCount = value
    },
    () => ({
      key: 'counter',
      wait: 1000,
      // leading: true, // default
      // trailing: true, // default
      // enabled: () => instantCount > 2,
    }),
  )

  function increment() {
    const nextCount = ++instantCount
    setCountThrottler.maybeExecute(nextCount)
  }
</script>

<div>
  <h1>TanStack Pacer createThrottler Example 1</h1>
  <table>
    <tbody
      ><setCountThrottler.Subscribe
        selector={(state) => ({ executionCount: state.executionCount })}
        >{#snippet children({ executionCount })}<tr
            ><td>Execution Count:</td><td>{executionCount}</td></tr
          ><tr><td>Instant Count:</td><td>{instantCount}</td></tr><tr
            ><td>Throttled Count:</td><td>{throttledCount}</td></tr
          >{/snippet}</setCountThrottler.Subscribe
      ></tbody
    >
  </table>
  <div>
    <button onclick={increment}>Increment</button><button
      onclick={() => setCountThrottler.flush()}
      style="margin-left: 10px"
    >
      Flush
    </button>
  </div>
  <setCountThrottler.Subscribe selector={(state) => state}
    >{#snippet children(state)}<pre style="margin-top: 20px">{JSON.stringify(
          state,
          null,
          2,
        )}</pre>{/snippet}</setCountThrottler.Subscribe
  >
</div>
