<script lang="ts">
  import { createDebouncer } from '@tanstack/svelte-pacer/debouncer'

  let currentValue = $state(50)

  let debouncedValue = $state(50)

  const debouncedSetValue = createDebouncer(
    (value: typeof debouncedValue) => {
      debouncedValue = value
    },
    () => ({
      wait: 250,
    }),
  ).maybeExecute

  function handleRangeChange(e: Event) {
    const newValue = parseInt((e.target as HTMLInputElement).value, 10)
    currentValue = newValue
    debouncedSetValue(newValue)
  }
</script>

<div>
  <h1>TanStack Pacer createDebouncer Example 3</h1>
  <div style="margin-bottom: 20px">
    <label
      >Current Range:<input
        type="range"
        min="0"
        max="100"
        value={currentValue}
        oninput={handleRangeChange}
        style="width: 100%"
      /><span>{currentValue}</span></label
    >
  </div>
  <div style="margin-bottom: 20px">
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
  <div style="color: #666; font-size: 0.9em">
    <p>Debounced to 250ms wait time</p>
  </div>
</div>
