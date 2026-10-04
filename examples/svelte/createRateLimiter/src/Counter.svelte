<script lang="ts">
  import {
    rateLimiterOptions,
    createRateLimiter,
  } from '@tanstack/svelte-pacer/rate-limiter'
  const commonRateLimiterOptions = rateLimiterOptions({
    limit: 5,
    window: 5000,
  })
  let windowType = $state<'fixed' | 'sliding'>('fixed')

  let instantCount = $state(0)

  let limitedCount = $state(0)

  const rateLimiter = createRateLimiter(
    (value: typeof limitedCount) => {
      limitedCount = value
    },
    () => ({
      key: 'counter',
      // enabled: () => instantCount > 2,
      ...commonRateLimiterOptions,
      windowType: windowType,
      onReject: (rateLimiter) =>
        console.log(
          'Rejected by rate limiter',
          rateLimiter.getMsUntilNextWindow(),
        ),
    }),
  )

  function increment() {
    const nextCount = ++instantCount
    rateLimiter.maybeExecute(nextCount)
  }
  // Selected counters invalidate these imperative window readouts.
  function readWindow(_executionCount: number, _rejectionCount: number) {
    return {
      remaining: rateLimiter.getRemainingInWindow(),
      milliseconds: rateLimiter.getMsUntilNextWindow(),
    }
  }
</script>

<div>
  <h1>TanStack Pacer createRateLimiter Example 1</h1>
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
      ><rateLimiter.Subscribe
        selector={(state) => ({
          executionCount: state.executionCount,
          rejectionCount: state.rejectionCount,
        })}
        >{#snippet children({ executionCount, rejectionCount })}<tr
            ><td>Execution Count:</td><td>{executionCount}</td></tr
          ><tr><td>Rejection Count:</td><td>{rejectionCount}</td></tr><tr
            ><td>Remaining in Window:</td><td
              >{readWindow(executionCount, rejectionCount).remaining}</td
            ></tr
          ><tr
            ><td>Ms Until Next Window:</td><td
              >{readWindow(executionCount, rejectionCount).milliseconds}</td
            ></tr
          ><tr><td colspan={2}><hr /></td></tr><tr
            ><td>Instant Count:</td><td>{instantCount}</td></tr
          ><tr><td>Rate Limited Count:</td><td>{limitedCount}</td></tr
          >{/snippet}</rateLimiter.Subscribe
      ></tbody
    >
  </table>
  <div>
    <button onclick={increment}>Increment</button><button
      onclick={() => rateLimiter.reset()}>Reset</button
    >
  </div>
  <rateLimiter.Subscribe selector={(state) => state}
    >{#snippet children(state)}<pre style="margin-top: 20px">{JSON.stringify(
          state,
          null,
          2,
        )}</pre>{/snippet}</rateLimiter.Subscribe
  >
</div>
