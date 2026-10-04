<script lang="ts">
  import { createRateLimitedValue } from '@tanstack/svelte-pacer/rate-limiter'

  let windowType = $state<'fixed' | 'sliding'>('fixed')

  let instantCount = $state(0)

  const [limitedCount] = createRateLimitedValue(
    () => instantCount,
    () => ({
      // enabled: () => instantCount > 2, // optional, defaults to true
      limit: 5,
      window: 5000,
      windowType: windowType,
      onReject: (rateLimiter) =>
        console.log(
          'Rejected by rate limiter',
          rateLimiter.getMsUntilNextWindow(),
        ),
    }),
  )

  function increment() {
    instantCount = instantCount + 1
  }
</script>

<div>
  <h1>TanStack Pacer createRateLimitedValue Example 1</h1>
  <div style="display: grid; gap: 0.5rem; margin-bottom: 1rem">
    <label
      ><input
        type="radio"
        name="windowType"
        value="fixed"
        checked={windowType === 'fixed'}
        oninput={() => (windowType = 'fixed')}
      />Fixed Window</label
    ><label
      ><input
        type="radio"
        name="windowType"
        value="sliding"
        checked={windowType === 'sliding'}
        oninput={() => (windowType = 'sliding')}
      />Sliding Window</label
    >
  </div>
  <table>
    <tbody
      ><tr><td>Instant Count:</td><td>{instantCount}</td></tr><tr
        ><td>Rate Limited Count:</td><td>{limitedCount()}</td></tr
      ></tbody
    >
  </table>
  <div><button onclick={increment}>Increment</button></div>
</div>
