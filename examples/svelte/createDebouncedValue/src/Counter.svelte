<script lang="ts">
  import { createDebouncedValue } from '@tanstack/svelte-pacer/debouncer'

  let instantCount = $state(0)

  function increment() {
    instantCount = instantCount + 1
  }

  const [debouncedCount] = createDebouncedValue(
    () => instantCount,
    () => ({
      wait: 500,
      // enabled: () => instantCount > 2, // optional, defaults to true
      // leading: true, // optional, defaults to false
    }),
  )
</script>

<div>
  <h1>TanStack Pacer createDebouncedValue Example 1</h1>
  <table>
    <tbody
      ><tr><td>Instant Count:</td><td>{instantCount}</td></tr><tr
        ><td>Debounced Count:</td><td>{debouncedCount()}</td></tr
      ></tbody
    >
  </table>
  <div><button onclick={increment}>Increment</button></div>
</div>
