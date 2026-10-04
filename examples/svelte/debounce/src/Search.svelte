<script lang="ts">
  import { debounce } from '@tanstack/svelte-pacer/debouncer'

  let searchText = $state('')

  let debouncedSearchText = $state('')

  // Create debounced setter function - Stable reference required!
  const debouncedSetSearch = debounce(
    (value: typeof debouncedSearchText) => (debouncedSearchText = value),
    {
      wait: 500,
    },
  )

  function handleSearchChange(e: Event) {
    const newValue = (e.target as HTMLInputElement).value
    searchText = newValue
    debouncedSetSearch(newValue)
  }
</script>

<div>
  <h1>TanStack Pacer debounce Example 2</h1>
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
        ><td>Debounced Search:</td><td>{debouncedSearchText}</td></tr
      ></tbody
    >
  </table>
</div>
