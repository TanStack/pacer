<script lang="ts">
  import { createThrottledValue } from '@tanstack/svelte-pacer/throttler'

  let submittedCount = $state(1)

  let currentValue = $state(50)

  const [throttledValue, throttler] = createThrottledValue(
    () => currentValue,
    () => ({
      wait: 250,
    }),
  )

  function handleRangeChange(e: Event) {
    const newValue = parseInt((e.target as HTMLInputElement).value, 10)
    currentValue = newValue
    submittedCount = submittedCount + 1
  }
</script>

<div>
  <h1>TanStack Pacer createThrottledValue Example 3</h1>
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
  <throttler.Subscribe
    selector={(state) => ({
      executionCount: state.executionCount,
    })}
    >{#snippet children({ executionCount })}<table>
        <tbody
          ><tr><td>Values Submitted:</td><td>{submittedCount}</td></tr><tr
            ><td>Throttled Execution Count:</td><td>{executionCount}</td></tr
          ><tr
            ><td>Saved Executions:</td><td
              >{submittedCount - executionCount} ({submittedCount > 0
                ? (
                    ((submittedCount - executionCount) / submittedCount) *
                    100
                  ).toFixed(2)
                : 0}% Reduction in execution calls)
            </td></tr
          ></tbody
        >
      </table>
      <div style="color: #666; font-size: 0.9em">
        <p>Throttled to 1 update per 250ms</p>
      </div>{/snippet}</throttler.Subscribe
  >
  <pre style="margin-top: 20px"><throttler.Subscribe selector={(state) => state}
      >{#snippet children(state)}{JSON.stringify(
          state,
          null,
          2,
        )}{/snippet}</throttler.Subscribe
    ></pre>
</div>
