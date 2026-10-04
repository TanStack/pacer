<script lang="ts">
  import { throttle } from '@tanstack/svelte-pacer/throttler'

  let currentValue = $state(50)

  let throttledValue = $state(50)

  let instantExecutionCount = $state(0)

  // Create throttled setter function - Stable reference required!
  const throttledSetValue = throttle(
    (value: typeof throttledValue) => (throttledValue = value),
    {
      wait: 250,
    },
  )

  function handleRangeChange(e: Event) {
    const newValue = parseInt((e.target as HTMLInputElement).value, 10)
    currentValue = newValue
    instantExecutionCount = instantExecutionCount + 1
    throttledSetValue(newValue)
  }
</script>

<div>
  <h1>TanStack Pacer throttle Example 3</h1>
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
  <table>
    <tbody
      ><tr><td>Instant Executions:</td><td>{instantExecutionCount}</td></tr
      ></tbody
    >
  </table>
  <div style="color: #666; font-size: 0.9em">
    <p>Throttled with 250ms wait time</p>
  </div>
</div>
