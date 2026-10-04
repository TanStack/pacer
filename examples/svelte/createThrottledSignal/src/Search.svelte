<script lang="ts">
  import { untrack } from 'svelte'

  import { createThrottledSignal } from '@tanstack/svelte-pacer/throttler'

  let instantSearch = $state('')

  const [throttledSearch, setThrottledSearch, throttler] =
    createThrottledSignal(
      untrack(() => instantSearch),
      () => ({
        wait: 1000,
        // enabled: () => instantSearch.length > 2, // optional, defaults to true
      }),
    )

  function handleSearchChange(e: Event) {
    const newValue = (e.target as HTMLInputElement).value

    instantSearch = newValue
    setThrottledSearch(newValue)
  }
</script>

<div>
  <h1>TanStack Pacer createThrottledSignal Example 2</h1>
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
      ><throttler.Subscribe
        selector={(state) => ({ executionCount: state.executionCount })}
        >{#snippet children({ executionCount })}<tr
            ><td>Execution Count:</td><td>{executionCount}</td></tr
          ><tr><td>Instant Search:</td><td>{instantSearch}</td></tr><tr
            ><td>Throttled Search:</td><td>{throttledSearch()}</td></tr
          >{/snippet}</throttler.Subscribe
      ></tbody
    >
  </table>
  <throttler.Subscribe selector={(state) => state}
    >{#snippet children(state)}<pre style="margin-top: 20px">{JSON.stringify(
          state,
          null,
          2,
        )}</pre>{/snippet}</throttler.Subscribe
  >
</div>
