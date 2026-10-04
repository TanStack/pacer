<script lang="ts">
  import { createDebouncedValue } from '@tanstack/svelte-pacer/debouncer'

  let instantSearch = $state('')

  const [debouncedSearch] = createDebouncedValue(
    () => instantSearch,
    () => ({
      wait: 500,
      enabled: instantSearch.length > 2, // optional, defaults to true
    }),
  )

  function handleSearchChange(e: Event) {
    instantSearch = (e.target as HTMLInputElement).value
  }
</script>

<div>
  <h1>TanStack Pacer createDebouncedValue Example 2</h1>
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
        ><td>Debounced Search:</td><td>{debouncedSearch()}</td></tr
      ></tbody
    >
  </table>
</div>
