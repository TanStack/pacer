<script lang="ts">
  import { rateLimit } from '@tanstack/svelte-pacer/rate-limiter'

  let windowType = $state<'fixed' | 'sliding'>('fixed')

  let instantCount = $state(0)

  let rateLimitedCount = $state(0)

  // Create rate-limited setter function - Stable reference required!
  const rateLimitedSetCount = $derived.by(() =>
    rateLimit((value: typeof rateLimitedCount) => (rateLimitedCount = value), {
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
    // this pattern helps avoid common bugs with stale closures and state
    instantCount = ((c) => {
      const newInstantCount = c + 1 // common new value for both
      rateLimitedSetCount(newInstantCount) // rate-limited state update
      return newInstantCount // instant state update
    })(instantCount)
  }
</script>

<div>
  <h1>TanStack Pacer rateLimit Example 1</h1>
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
        ><td>Rate Limited Count:</td><td>{rateLimitedCount}</td></tr
      ></tbody
    >
  </table>
  <div><button onclick={increment}>Increment</button></div>
</div>
