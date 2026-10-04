<script lang="ts">
  import { createDebouncedValue } from '@tanstack/svelte-pacer/debouncer'

  let currentValue = $state(50)

  let submittedCount = $state(1)

  const [debouncedValue, debouncer] = createDebouncedValue(
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
  <h1>TanStack Pacer createDebouncedValue Example 3</h1>
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
        value={debouncedValue()}
        disabled
        style="width: 100%"
      /><span>{debouncedValue()}</span></label
    >
  </div>
  <debouncer.Subscribe
    selector={(state) => ({
      isPending: state.isPending,
      executionCount: state.executionCount,
    })}
    >{#snippet children({ isPending, executionCount })}<table>
        <tbody
          ><tr><td>Is Pending:</td><td>{isPending.toString()}</td></tr><tr
            ><td>Values Submitted:</td><td>{submittedCount}</td></tr
          ><tr><td>Debounced Executions:</td><td>{executionCount}</td></tr><tr
            ><td>Saved Executions:</td><td>{submittedCount - executionCount}</td
            ></tr
          ><tr
            ><td>% Reduction:</td><td
              >{#if submittedCount === 0}{'0'}{:else}{Math.round(
                  ((submittedCount - executionCount) / submittedCount) * 100,
                )}{/if}%
            </td></tr
          ></tbody
        >
      </table>
      <div style="color: #666; font-size: 0.9em">
        <p>Debounced to 250ms wait time</p>
      </div>{/snippet}</debouncer.Subscribe
  >
  <pre style="margin-top: 20px"><debouncer.Subscribe selector={(state) => state}
      >{#snippet children(state)}{JSON.stringify(
          state,
          null,
          2,
        )}{/snippet}</debouncer.Subscribe
    ></pre>
</div>
