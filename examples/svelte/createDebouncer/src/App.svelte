<script lang="ts">
  import { TanStackDevtools } from '@tanstack/svelte-devtools'
  import { pacerDevtoolsPlugin } from '@tanstack/svelte-pacer-devtools'
  import { createDebouncer } from '@tanstack/svelte-pacer/debouncer'

  let instantCount = $state(0)
  let debouncedCount = $state(0)
  const debouncer = createDebouncer(
    (count: number) => {
      debouncedCount = count
    },
    {
      key: 'counter',
      wait: 800,
      enabled: () => instantCount > 2,
      // leading: true, // optional, defaults to false
    },
    // Alternative to Subscribe: select state here to update this component.
    // (state) => state,
  )

  function increment() {
    debouncer.maybeExecute(++instantCount)
  }

  let searchText = $state('')
  let debouncedSearchText = $state('')
  const setSearchDebouncer = createDebouncer(
    (value: string) => {
      debouncedSearchText = value
    },
    { key: 'search', wait: 500, enabled: () => searchText.length > 2 },
  )

  function handleSearchChange(event: Event) {
    searchText = (event.target as HTMLInputElement).value
    setSearchDebouncer.maybeExecute(searchText)
  }

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
  <div>
    <h1>TanStack Pacer createDebouncer Example 1</h1>
    <table>
      <tbody>
        <debouncer.Subscribe
          selector={(state) => ({
            status: state.status,
            executionCount: state.executionCount,
          })}
        >
          {#snippet children({ status, executionCount })}
            <tr><td>Status:</td><td>{status}</td></tr>
            <tr><td>Execution Count:</td><td>{executionCount}</td></tr>
          {/snippet}
        </debouncer.Subscribe>
        <tr><td colspan="2"><hr /></td></tr>
        <tr><td>Instant Count:</td><td>{instantCount}</td></tr>
        <tr><td>Debounced Count:</td><td>{debouncedCount}</td></tr>
      </tbody>
    </table>
    <div>
      <button onclick={increment}>Increment</button><button
        onclick={() => debouncer.flush()}
        style="margin-left: 10px">Flush</button
      >
    </div>
    <debouncer.Subscribe selector={(state) => state}>
      {#snippet children(state)}
        <pre style="margin-top: 20px">{JSON.stringify(state, null, 2)}</pre>
      {/snippet}
    </debouncer.Subscribe>
  </div>
  <hr />
  <div>
    <h1>TanStack Pacer createDebouncer Example 2</h1>
    <div>
      <!-- svelte-ignore a11y_autofocus -->
      <input
        autofocus
        type="search"
        value={searchText}
        oninput={handleSearchChange}
        placeholder="Type to search..."
        style="width: 100%; margin-bottom: 1rem"
      />
    </div>
    <table>
      <tbody>
        <setSearchDebouncer.Subscribe
          selector={(state) => ({
            isPending: state.isPending,
            executionCount: state.executionCount,
          })}
        >
          {#snippet children({ isPending, executionCount })}
            <tr><td>Is Pending:</td><td>{isPending.toString()}</td></tr>
            <tr><td>Execution Count:</td><td>{executionCount}</td></tr>
          {/snippet}
        </setSearchDebouncer.Subscribe>
        <tr><td colspan="2"><hr /></td></tr>
        <tr><td>Instant Search:</td><td>{searchText}</td></tr>
        <tr><td>Debounced Search:</td><td>{debouncedSearchText}</td></tr>
      </tbody>
    </table>
    <div><button onclick={() => setSearchDebouncer.flush()}>Flush</button></div>
    <setSearchDebouncer.Subscribe selector={(state) => state}>
      {#snippet children(state)}
        <pre style="margin-top: 20px">{JSON.stringify(state, null, 2)}</pre>
      {/snippet}
    </setSearchDebouncer.Subscribe>
  </div>
  <hr />
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
            <tr><td>Instant Executions:</td><td>{instantExecutionCount}</td></tr
            >
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
</div>

{#if import.meta.env.DEV}
  <TanStackDevtools plugins={[pacerDevtoolsPlugin()]} />
{/if}
