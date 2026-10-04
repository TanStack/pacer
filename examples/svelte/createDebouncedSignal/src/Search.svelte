<script lang="ts">
  import { untrack } from 'svelte'

  import { createDebouncedSignal } from '@tanstack/svelte-pacer/debouncer'

  let instantSearch = $state('')

  let instantSearchRef = $state('')

  const [debouncedSearch, setDebouncedSearch, debouncer] =
    createDebouncedSignal(
      untrack(() => instantSearch),
      () => ({
        wait: 500,
        enabled: () => instantSearchRef.length > 2, // optional, defaults to true
      }),
    )

  function handleSearchChange(e: Event) {
    const newValue = (e.target as HTMLInputElement).value
    instantSearchRef = newValue
    instantSearch = newValue
    setDebouncedSearch(newValue)
  }
</script>

<div>
  <h1>TanStack Pacer createDebouncedSignal Example 2</h1>
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
      ><debouncer.Subscribe
        selector={(state) => ({
          isPending: state.isPending,
          executionCount: state.executionCount,
        })}
        >{#snippet children({ isPending, executionCount })}<tr
            ><td>Is Pending:</td><td>{isPending.toString()}</td></tr
          ><tr><td>Execution Count:</td><td>{executionCount}</td></tr><tr
            ><td colspan={2}><hr /></td></tr
          ><tr><td>Instant Search:</td><td>{instantSearch}</td></tr><tr
            ><td>Debounced Search:</td><td>{debouncedSearch()}</td></tr
          >{/snippet}</debouncer.Subscribe
      ></tbody
    >
  </table>
  <debouncer.Subscribe selector={(state) => state}
    >{#snippet children(state)}<pre style="margin-top: 20px">{JSON.stringify(
          state,
          null,
          2,
        )}</pre>{/snippet}</debouncer.Subscribe
  >
</div>
