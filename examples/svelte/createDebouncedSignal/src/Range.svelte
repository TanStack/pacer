<script lang="ts">
  import { untrack } from 'svelte'

  import { createDebouncedSignal } from '@tanstack/svelte-pacer/debouncer'

  let currentValue = $state(50)

  let instantExecutionCount = $state(0)

  const [debouncedValue, setDebouncedValue, debouncer] = createDebouncedSignal(
    untrack(() => currentValue),
    () => ({
      wait: 250,
    }),
  )

  function handleRangeChange(e: Event) {
    const newValue = parseInt((e.target as HTMLInputElement).value, 10)
    currentValue = newValue
    instantExecutionCount = instantExecutionCount + 1
    setDebouncedValue(newValue)
  }
</script>

<div>
  <h1>TanStack Pacer createDebouncedSignal Example 3</h1>
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
  <table>
    <tbody
      ><debouncer.Subscribe
        selector={(state) => ({
          isPending: state.isPending,
          executionCount: state.executionCount,
        })}
        >{#snippet children({ isPending, executionCount })}<tr
            ><td>Is Pending:</td><td>{isPending.toString()}</td></tr
          ><tr><td>Instant Executions:</td><td>{instantExecutionCount}</td></tr
          ><tr><td>Debounced Executions:</td><td>{executionCount}</td></tr><tr
            ><td>Saved Executions:</td><td
              >{instantExecutionCount - executionCount}</td
            ></tr
          ><tr
            ><td>% Reduction:</td><td
              >{#if instantExecutionCount === 0}{'0'}{:else}{Math.round(
                  ((instantExecutionCount - executionCount) /
                    instantExecutionCount) *
                    100,
                )}{/if}%
            </td></tr
          >{/snippet}</debouncer.Subscribe
      ></tbody
    >
  </table>
  <div style="color: #666; font-size: 0.9em">
    <p>Debounced to 250ms wait time</p>
  </div>
  <debouncer.Subscribe selector={(state) => state}
    >{#snippet children(state)}<pre style="margin-top: 20px">{JSON.stringify(
          state,
          null,
          2,
        )}</pre>{/snippet}</debouncer.Subscribe
  >
</div>
