<script lang="ts">
  import { createThrottledValue } from '@tanstack/svelte-pacer/throttler'

  let instantSearch = $state('')

  const [throttledSearch] = createThrottledValue(
    () => instantSearch,
    () => ({
      wait: 1000,
      // enabled: instantSearch.length > 2, // optional, defaults to true
    }),
  )

  function handleSearchChange(e: Event) {
    instantSearch = (e.target as HTMLInputElement).value
  }
</script>

<div>
  <h1>TanStack Pacer createThrottledValue Example 2</h1>
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
        ><td>Throttled Search:</td><td>{throttledSearch()}</td></tr
      ></tbody
    >
  </table>
</div>
