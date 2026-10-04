<script lang="ts">
  import { debounce } from '@tanstack/svelte-pacer/debouncer'

  let instantCount = $state(0)

  let debouncedCount = $state(0)

  // Create debounced setter function - Stable reference required!
  const debouncedSetCount = debounce(
    (value: typeof debouncedCount) => (debouncedCount = value),
    {
      wait: 500,
      // leading: true, // optional, defaults to false
    },
  )

  function increment() {
    // this pattern helps avoid common bugs with stale closures and state
    instantCount = ((c) => {
      const newInstantCount = c + 1 // common new value for both
      debouncedSetCount(newInstantCount) // debounced state update
      return newInstantCount // instant state update
    })(instantCount)
  }
</script>

<div>
  <h1>TanStack Pacer debounce Example 1</h1>
  <table>
    <tbody
      ><tr><td>Instant Count:</td><td>{instantCount}</td></tr><tr
        ><td>Debounced Count:</td><td>{debouncedCount}</td></tr
      ></tbody
    >
  </table>
  <div><button onclick={increment}>Increment</button></div>
</div>
