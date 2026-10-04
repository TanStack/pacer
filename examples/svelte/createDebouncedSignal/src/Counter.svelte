<script lang="ts">
  import { untrack } from 'svelte'

  import { createDebouncedSignal } from '@tanstack/svelte-pacer/debouncer'

  let instantCount = $state(0)

  let instantCountRef = $state(0)

  const [debouncedCount, setDebouncedCount, debouncer] = createDebouncedSignal(
    untrack(() => instantCount),
    () => ({
      wait: 500,
      // enabled: () => instantCount > 2, // optional, defaults to true
      // leading: true, // optional, defaults to false
    }),
  )

  function increment() {
    const nextCount = ++instantCountRef
    instantCount = nextCount
    setDebouncedCount(nextCount)
  }
</script>

<div>
  <h1>TanStack Pacer createDebouncedSignal Example 1</h1>
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
          ><tr><td>Instant Count:</td><td>{instantCount}</td></tr><tr
            ><td>Debounced Count:</td><td>{debouncedCount()}</td></tr
          >{/snippet}</debouncer.Subscribe
      ></tbody
    >
  </table>
  <div><button onclick={increment}>Increment</button></div>
  <debouncer.Subscribe selector={(state) => state}
    >{#snippet children(state)}<pre style="margin-top: 20px">{JSON.stringify(
          state,
          null,
          2,
        )}</pre>{/snippet}</debouncer.Subscribe
  >
</div>
