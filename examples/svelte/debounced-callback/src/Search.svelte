<script lang="ts">
  import { createDebouncer } from '@tanstack/svelte-pacer/debouncer'

  let searchText = $state('')

  let searchTextRef = $state('')

  let debouncedSearchText = $state('')

  const debouncedSetSearch = createDebouncer(
    (value: typeof debouncedSearchText) => {
      debouncedSearchText = value
    },
    () => ({
      wait: 500,
      enabled: () => searchTextRef.length > 2,
    }),
  ).maybeExecute

  function handleSearchChange(e: Event) {
    const newValue = (e.target as HTMLInputElement).value
    searchTextRef = newValue
    searchText = newValue
    debouncedSetSearch(newValue)
  }
</script>

<div>
  <h1>TanStack Pacer createDebouncer Example 2</h1>
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
