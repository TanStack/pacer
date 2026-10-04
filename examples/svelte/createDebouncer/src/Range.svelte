<script lang="ts">
  import { createDebouncer } from '@tanstack/svelte-pacer/debouncer'

  let currentValue = $state(50)
  let debouncedValue = $state(50)
  let instantExecutionCount = $state(0)
  let wait = $state(250)
  let enabled = $state(true)
  const setValueDebouncer = createDebouncer(
    (value: number) => {
      debouncedValue = value
    },
    () => ({ key: 'range', wait: wait, enabled: enabled }),
  )

  function handleRangeChange(event: Event) {
    currentValue = (event.target as HTMLInputElement).valueAsNumber
    instantExecutionCount++
    setValueDebouncer.maybeExecute(currentValue)
  }
</script>

<div>
  <h1>TanStack Pacer createDebouncer Example 3</h1>
  <fieldset>
    <legend>Reactive options</legend>
    <label>
      Delay: {wait} ms<input
        type="range"
        min="0"
        max="1500"
        step="50"
        bind:value={wait}
      />
    </label><label
      ><input type="checkbox" bind:checked={enabled} />Enabled</label
    >
    <p>
      Changing the delay affects the next scheduled call. Disabling cancels
      pending work.
    </p>
  </fieldset>
  <div style="margin-bottom: 20px">
    <label
      >Current Range:<input
        type="range"
        min="0"
        max="100"
        value={currentValue}
        oninput={handleRangeChange}
        style="width: 100%"
      /><span>{currentValue}</span>
    </label>
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
      /><span>{debouncedValue}</span>
    </label>
  </div>
  <table>
    <tbody>
      <setValueDebouncer.Subscribe
        selector={(state) => ({
          isPending: state.isPending,
          executionCount: state.executionCount,
        })}
      >
        {#snippet children({ isPending, executionCount })}
          <tr><td>Is Pending:</td><td>{isPending.toString()}</td></tr>
          <tr><td>Instant Executions:</td><td>{instantExecutionCount}</td></tr>
          <tr><td>Debounced Executions:</td><td>{executionCount}</td></tr>
          <tr
            ><td>Saved Executions:</td><td
              >{instantExecutionCount - executionCount}</td
            ></tr
          >
          <tr
            ><td>% Reduction:</td><td
              >{instantExecutionCount === 0
                ? '0'
                : Math.round(
                    ((instantExecutionCount - executionCount) /
                      instantExecutionCount) *
                      100,
                  )}%</td
            ></tr
          >
        {/snippet}
      </setValueDebouncer.Subscribe>
    </tbody>
  </table>
  <div style="color: #666; font-size: 0.9em">
    <p>Debounced to {wait}ms wait time</p>
  </div>
  <div><button onclick={() => setValueDebouncer.flush()}>Flush</button></div>
  <setValueDebouncer.Subscribe selector={(state) => state}>
    {#snippet children(state)}
      <pre style="margin-top: 20px">{JSON.stringify(state, null, 2)}</pre>
    {/snippet}
  </setValueDebouncer.Subscribe>
</div>
