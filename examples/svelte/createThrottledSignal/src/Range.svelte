<script lang="ts">
  import { untrack } from 'svelte'

  import { createThrottledSignal } from '@tanstack/svelte-pacer/throttler'

  let instantExecutionCount = $state(0)

  let currentValue = $state(50)

  const [throttledValue, setThrottledValue, throttler] = createThrottledSignal(
    untrack(() => currentValue),
    () => ({
      wait: 250,
    }),
  )

  function handleRangeChange(e: Event) {
    const newValue = parseInt((e.target as HTMLInputElement).value, 10)
    currentValue = newValue
    setThrottledValue(newValue)
    instantExecutionCount = instantExecutionCount + 1
  }
</script>

<div>
  <h1>TanStack Pacer createThrottledSignal Example 3</h1>
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
        value={throttledValue()}
        disabled
        style="width: 100%"
      /><span>{throttledValue()}</span></label
    >
  </div>
  <table>
    <tbody
      ><throttler.Subscribe
        selector={(state) => ({ executionCount: state.executionCount })}
        >{#snippet children({ executionCount })}<tr
            ><td>Instant Execution Count:</td><td>{instantExecutionCount}</td
            ></tr
          ><tr><td>Throttled Execution Count:</td><td>{executionCount}</td></tr
          ><tr
            ><td>Saved Executions:</td><td
              >{instantExecutionCount - executionCount} ({instantExecutionCount >
              0
                ? (
                    ((instantExecutionCount - executionCount) /
                      instantExecutionCount) *
                    100
                  ).toFixed(2)
                : 0}% Reduction in execution calls)
            </td></tr
          >{/snippet}</throttler.Subscribe
      ></tbody
    >
  </table>
  <div style="color: #666; font-size: 0.9em">
    <p>Throttled to 1 update per 250ms</p>
  </div>
  <throttler.Subscribe selector={(state) => state}
    >{#snippet children(state)}<pre style="margin-top: 20px">{JSON.stringify(
          state,
          null,
          2,
        )}</pre>{/snippet}</throttler.Subscribe
  >
</div>
