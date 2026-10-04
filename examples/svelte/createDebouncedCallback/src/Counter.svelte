<script lang="ts">
  import { createDebouncedCallback } from '@tanstack/svelte-pacer/debouncer'

  let instantCount = $state(0)

  let instantCountRef = $state(0)

  let debouncedCount = $state(0)

  const debouncedSetCount = createDebouncedCallback(
    (value: typeof debouncedCount) => {
      debouncedCount = value
    },
    () => ({
      wait: 500,
      // enabled: () => instantCount > 2, // optional, defaults to true
      // leading: true, // optional, defaults to false
    }),
  )

  function increment() {
    const nextCount = ++instantCountRef
    instantCount = nextCount
    debouncedSetCount(nextCount)
  }
</script>

<div>
  <h1>TanStack Pacer createDebouncedCallback Example 1</h1>
  <table>
    <tbody
      ><tr><td>Instant Count:</td><td>{instantCount}</td></tr><tr
        ><td>Debounced Count:</td><td>{debouncedCount}</td></tr
      ></tbody
    >
  </table>
  <div><button onclick={increment}>Increment</button></div>
</div>
