<script lang="ts">
  import { createRateLimitedValue } from '@tanstack/svelte-pacer/rate-limiter'

  let windowType = $state<'fixed' | 'sliding'>('fixed')

  let instantSearch = $state('')

  const [limitedSearch] = createRateLimitedValue(
    () => instantSearch,
    () => ({
      // enabled: instantSearch.length > 2, // optional, defaults to true
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
    instantSearch = (e.target as HTMLInputElement).value
  }
</script>

<div>
  <h1>TanStack Pacer createRateLimitedValue Example 2</h1>
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
      ><tr><td>Instant Search:</td><td>{instantSearch}</td></tr><tr
        ><td>Rate Limited Search:</td><td>{limitedSearch()}</td></tr
      ></tbody
    >
  </table>
</div>
