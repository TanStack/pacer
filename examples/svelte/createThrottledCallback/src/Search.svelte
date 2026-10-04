<script lang="ts">
  import { createThrottledCallback } from '@tanstack/svelte-pacer/throttler'

  let searchText = $state('')

  let searchTextRef = $state('')

  let throttledSearchText = $state('')

  const throttledSetSearch = createThrottledCallback(
    (value: typeof throttledSearchText) => {
      throttledSearchText = value
    },
    () => ({
      wait: 1000,
      enabled: () => searchTextRef.length > 2,
    }),
  )

  function handleSearchChange(e: Event) {
    const newValue = (e.target as HTMLInputElement).value
    searchTextRef = newValue
    searchText = newValue
    throttledSetSearch(newValue)
  }
</script>

<div>
  <h1>TanStack Pacer createThrottledCallback Example 2</h1>
  <div>
    <input
      type="search"
      value={searchText}
      oninput={handleSearchChange}
      placeholder="Type to search..."
      style="width: 100%"
    />
  </div>
  <table>
    <tbody
      ><tr><td>Instant Search:</td><td>{searchText}</td></tr><tr
        ><td>Throttled Search:</td><td>{throttledSearchText}</td></tr
      ></tbody
    >
  </table>
</div>
