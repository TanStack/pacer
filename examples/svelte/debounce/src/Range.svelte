<script lang="ts">
  import { debounce } from '@tanstack/svelte-pacer/debouncer'

  let instantValue = $state(50)

  let debouncedValue = $state(50)

  // Create debounced setter function - Stable reference required!
  const debouncedSetValue = debounce(
    (value: typeof debouncedValue) => (debouncedValue = value),
    {
      wait: 250,
    },
  )

  function handleRangeChange(e: Event) {
    const newValue = parseInt((e.target as HTMLInputElement).value, 10)
    instantValue = newValue
    debouncedSetValue(newValue)
  }
</script>

<div>
  <h1>TanStack Pacer debounce Example 3</h1>
  <div style="margin-bottom: 20px">
    <label
      >Instant Range:<input
        type="range"
        min="0"
        max="100"
        value={instantValue}
        oninput={handleRangeChange}
        style="width: 100%"
      /><span>{instantValue}</span></label
    >
  </div>
  <div>
    <label
      >Debounced Range (Readonly):<input
        type="range"
        min="0"
        max="100"
        value={debouncedValue}
        disabled
        style="width: 100%"
      /><span>{debouncedValue}</span></label
    >
  </div>
</div>
