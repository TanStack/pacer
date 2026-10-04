<script lang="ts">
  import { createThrottler } from '@tanstack/svelte-pacer/throttler'

  let instantSearch = $state('')

  let throttledSearch = $state('')

  const setSearchThrottler = createThrottler(
    (value: typeof throttledSearch) => {
      throttledSearch = value
    },
    () => ({
      key: 'search',
      wait: 1000,
      enabled: () => instantSearch.length > 2,
    }),
  )

  function handleSearchChange(e: Event) {
    const newValue = (e.target as HTMLInputElement).value
    instantSearch = newValue
    setSearchThrottler.maybeExecute(newValue)
  }
</script>

<div>
  <h1>TanStack Pacer createThrottler Example 2</h1>
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
      ><setSearchThrottler.Subscribe
        selector={(state) => ({ executionCount: state.executionCount })}
        >{#snippet children({ executionCount })}<tr
            ><td>Execution Count:</td><td>{executionCount}</td></tr
          ><tr><td>Instant Search:</td><td>{instantSearch}</td></tr><tr
            ><td>Throttled Search:</td><td>{throttledSearch}</td></tr
          >{/snippet}</setSearchThrottler.Subscribe
      ></tbody
    >
  </table>
  <div><button onclick={() => setSearchThrottler.flush()}>Flush</button></div>
  <setSearchThrottler.Subscribe selector={(state) => state}
    >{#snippet children(state)}<pre style="margin-top: 20px">{JSON.stringify(
          state,
          null,
          2,
        )}</pre>{/snippet}</setSearchThrottler.Subscribe
  >
</div>
