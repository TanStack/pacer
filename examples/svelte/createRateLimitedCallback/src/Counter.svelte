<script lang="ts">
  import { createRateLimitedCallback } from '@tanstack/svelte-pacer/rate-limiter'

  let windowType = $state<'fixed' | 'sliding'>('fixed')

  let instantCount = $state(0)

  let instantCountRef = $state(0)

  let rateLimitedCount = $state(0)

  const rateLimitedSetCount = createRateLimitedCallback(
    (value: typeof rateLimitedCount) => {
      rateLimitedCount = value
    },
    () => ({
      limit: 5,
      window: 5000,
      windowType: windowType,
      enabled: () => instantCountRef > 2,
      onReject: (rateLimiter) => {
        console.log(
          `Rate limit reached. Try again in ${rateLimiter.getMsUntilNextWindow()}ms`,
        )
      },
    }),
  )

  function increment() {
    const nextCount = ++instantCountRef
    instantCount = nextCount
    rateLimitedSetCount(nextCount)
  }
</script>

<div>
  <h1>TanStack Pacer createRateLimitedCallback Example 1</h1>
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
        ><td>RateLimited Count:</td><td>{rateLimitedCount}</td></tr
      ></tbody
    >
  </table>
  <div><button onclick={increment}>Increment</button></div>
</div>
