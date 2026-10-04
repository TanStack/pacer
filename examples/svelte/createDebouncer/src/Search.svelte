<script lang="ts">
  import { createDebouncer } from '@tanstack/svelte-pacer/debouncer'

  let searchText = $state('')
  let debouncedSearchText = $state('')
  const setSearchDebouncer = createDebouncer(
    (value: string) => {
      debouncedSearchText = value
    },
    { key: 'search', wait: 500, enabled: () => searchText.length > 2 },
  )

  function handleSearchChange(event: Event) {
    searchText = (event.target as HTMLInputElement).value
    setSearchDebouncer.maybeExecute(searchText)
  }
</script>

<div>
  <h1>TanStack Pacer createDebouncer Example 2</h1>
  <div>
    <!-- svelte-ignore a11y_autofocus -->
    <input
      autofocus
      type="search"
      value={searchText}
      oninput={handleSearchChange}
      placeholder="Type to search..."
      style="width: 100%; margin-bottom: 1rem"
    />
  </div>
  <table>
    <tbody>
      <setSearchDebouncer.Subscribe
        selector={(state) => ({
          isPending: state.isPending,
          executionCount: state.executionCount,
        })}
      >
        {#snippet children({ isPending, executionCount })}
          <tr><td>Is Pending:</td><td>{isPending.toString()}</td></tr>
          <tr><td>Execution Count:</td><td>{executionCount}</td></tr>
        {/snippet}
      </setSearchDebouncer.Subscribe>
      <tr><td colspan="2"><hr /></td></tr>
      <tr><td>Instant Search:</td><td>{searchText}</td></tr>
      <tr><td>Debounced Search:</td><td>{debouncedSearchText}</td></tr>
    </tbody>
  </table>
  <div><button onclick={() => setSearchDebouncer.flush()}>Flush</button></div>
  <setSearchDebouncer.Subscribe selector={(state) => state}>
    {#snippet children(state)}
      <pre style="margin-top: 20px">{JSON.stringify(state, null, 2)}</pre>
    {/snippet}
  </setSearchDebouncer.Subscribe>
</div>
