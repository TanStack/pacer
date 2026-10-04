<script lang="ts">
  import { createThrottler } from '@tanstack/svelte-pacer/throttler'

  let currentValue = $state(50)

  let throttledValue = $state(50)

  const throttledSetValue = createThrottler(
    (value: typeof throttledValue) => {
      throttledValue = value
    },
    () => ({
      wait: 250,
    }),
  ).maybeExecute

  function handleRangeChange(e: Event) {
    const newValue = parseInt((e.target as HTMLInputElement).value, 10)
    currentValue = newValue
    throttledSetValue(newValue)
  }
</script>

<div>
  <h1>TanStack Pacer createThrottler Example 3</h1>
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
      >Throttled Range (Readonly):<input
        type="range"
        min="0"
        max="100"
        value={throttledValue}
        disabled
        style="width: 100%"
      /><span>{throttledValue}</span></label
    >
  </div>
  <div style="color: #666; font-size: 0.9em">
    <p>Throttled to 1 update per 250ms</p>
  </div>
</div>
