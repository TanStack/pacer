<script lang="ts">
  import { untrack } from 'svelte'

  const alert = window.alert.bind(window)
  import { createRateLimitedSignal } from '@tanstack/svelte-pacer/rate-limiter'

  let windowType = $state<'fixed' | 'sliding'>('fixed')

  let instantSearch = $state('')

  const [limitedSearch, setLimitedSearch, rateLimiter] =
    createRateLimitedSignal(
      untrack(() => instantSearch),
      () => ({
        // enabled: () => instantSearch.length > 2, // optional, defaults to true
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

  function handleSearchChange(e: Event) {
    const newValue = (e.target as HTMLInputElement).value

    instantSearch = newValue
    setLimitedSearch(newValue)
  }
</script>

<div>
  <h1>TanStack Pacer createRateLimitedSignal Example 2</h1>
  <div style="display: grid; gap: 0.5rem; margin-bottom: 1rem">
    <label
      ><input
        type="radio"
        name="windowType2"
        value="fixed"
        checked={windowType === 'fixed'}
        oninput={() => (windowType = 'fixed')}
      />Fixed Window</label
    ><label
      ><input
        type="radio"
        name="windowType2"
        value="sliding"
        checked={windowType === 'sliding'}
        oninput={() => (windowType = 'sliding')}
      />Sliding Window</label
    >
  </div>
  <div>
    <input
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
            ><td>Instant Search:</td><td>{instantSearch}</td></tr
          ><tr><td>Rate Limited Search:</td><td>{limitedSearch()}</td></tr
          >{/snippet}</rateLimiter.Subscribe
      ></tbody
    >
  </table>
  <div>
    <button onclick={() => alert(rateLimiter.getRemainingInWindow())}>
      Remaining in Window</button
    ><button onclick={() => alert(rateLimiter.reset())}>Reset</button>
  </div>
  <rateLimiter.Subscribe selector={(state) => state}
    >{#snippet children(state)}<pre style="margin-top: 20px">{JSON.stringify(
          state,
          null,
          2,
        )}</pre>{/snippet}</rateLimiter.Subscribe
  >
</div>
