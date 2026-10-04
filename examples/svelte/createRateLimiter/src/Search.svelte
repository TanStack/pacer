<script lang="ts">
  import {
    rateLimiterOptions,
    createRateLimiter,
  } from '@tanstack/svelte-pacer/rate-limiter'
  const commonRateLimiterOptions = rateLimiterOptions({
    limit: 5,
    window: 5000,
  })
  let instantSearch = $state('')

  let limitedSearch = $state('')

  const rateLimiter = createRateLimiter(
    (value: typeof limitedSearch) => {
      limitedSearch = value
    },
    () => ({
      key: 'search',
      enabled: () => instantSearch.length > 2, // optional, defaults to true
      ...commonRateLimiterOptions,
      // windowType: 'sliding', // default is 'fixed'
      onReject: (rateLimiter) =>
        console.log(
          'Rejected by rate limiter',
          rateLimiter.getMsUntilNextWindow(),
        ),
    }),
  )

  function handleSearchChange(e: Event) {
    const newValue = (e.target as HTMLInputElement).value
    instantSearch = newValue
    rateLimiter.maybeExecute(newValue)
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
  <h1>TanStack Pacer createRateLimiter Example 2</h1>
  <div>
    <!-- svelte-ignore a11y_autofocus: Focus the search field in this standalone demo. -->
    <input
      autofocus
      type="search"
      value={instantSearch}
      oninput={handleSearchChange}
      placeholder="Type to search..."
      style="width: 100%"
    />
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
            ><td>Instant Search:</td><td>{instantSearch}</td></tr
          ><tr><td>Rate Limited Search:</td><td>{limitedSearch}</td></tr
          >{/snippet}</rateLimiter.Subscribe
      ></tbody
    >
  </table>
  <div><button onclick={() => rateLimiter.reset()}>Reset</button></div>
  <rateLimiter.Subscribe selector={(state) => state}
    >{#snippet children(state)}<pre style="margin-top: 20px">{JSON.stringify(
          state,
          null,
          2,
        )}</pre>{/snippet}</rateLimiter.Subscribe
  >
</div>
