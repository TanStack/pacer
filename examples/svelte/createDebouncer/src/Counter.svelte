<script lang="ts">
  import { createDebouncer } from '@tanstack/svelte-pacer/debouncer'

  let instantCount = $state(0)
  let debouncedCount = $state(0)
  const debouncer = createDebouncer(
    (count: number) => {
      debouncedCount = count
    },
    {
      key: 'counter',
      wait: 800,
      enabled: () => instantCount > 2,
      // leading: true, // optional, defaults to false
    },
    // Alternative to Subscribe: select state here to update this component.
    // (state) => state,
  )

  function increment() {
    debouncer.maybeExecute(++instantCount)
  }
</script>

<div>
  <h1>TanStack Pacer createDebouncer Example 1</h1>
  <table>
    <tbody>
      <debouncer.Subscribe
        selector={(state) => ({
          status: state.status,
          executionCount: state.executionCount,
        })}
      >
        {#snippet children({ status, executionCount })}
          <tr><td>Status:</td><td>{status}</td></tr>
          <tr><td>Execution Count:</td><td>{executionCount}</td></tr>
        {/snippet}
      </debouncer.Subscribe>
      <tr><td colspan="2"><hr /></td></tr>
      <tr><td>Instant Count:</td><td>{instantCount}</td></tr>
      <tr><td>Debounced Count:</td><td>{debouncedCount}</td></tr>
    </tbody>
  </table>
  <div>
    <button onclick={increment}>Increment</button><button
      onclick={() => debouncer.flush()}
      style="margin-left: 10px">Flush</button
    >
  </div>
  <debouncer.Subscribe selector={(state) => state}>
    {#snippet children(state)}
      <pre style="margin-top: 20px">{JSON.stringify(state, null, 2)}</pre>
    {/snippet}
  </debouncer.Subscribe>
</div>
