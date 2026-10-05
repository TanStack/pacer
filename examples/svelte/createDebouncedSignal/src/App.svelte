<script lang="ts">
  import { TanStackDevtools } from '@tanstack/svelte-devtools'
  import { pacerDevtoolsPlugin } from '@tanstack/svelte-pacer-devtools'
  import { untrack } from 'svelte'
  import { createDebouncedSignal } from '@tanstack/svelte-pacer/debouncer'

  let instantCount = $state(0)

  let instantCountRef = $state(0)

  const [debouncedCount, setDebouncedCount, counterDebouncer] =
    createDebouncedSignal(
      untrack(() => instantCount),
      () => ({
        wait: 500,
        // enabled: () => instantCount > 2, // optional, defaults to true
        // leading: true, // optional, defaults to false
      }),
    )

  function increment() {
    const nextCount = ++instantCountRef
    instantCount = nextCount
    setDebouncedCount(nextCount)
  }

  let currentValue = $state(50)

  let instantExecutionCount = $state(0)

  const [debouncedValue, setDebouncedValue, rangeDebouncer] =
    createDebouncedSignal(
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

  let instantSearch = $state('')

  let instantSearchRef = $state('')

  const [debouncedSearch, setDebouncedSearch, searchDebouncer] =
    createDebouncedSignal(
      untrack(() => instantSearch),
      () => ({
        wait: 500,
        enabled: () => instantSearchRef.length > 2, // optional, defaults to true
      }),
    )

  function handleSearchChange(e: Event) {
    const newValue = (e.target as HTMLInputElement).value
    instantSearchRef = newValue
    instantSearch = newValue
    setDebouncedSearch(newValue)
  }
</script>

<div>
  <div>
    <h1>TanStack Pacer createDebouncedSignal Example 1</h1>
    <table>
      <tbody
        ><counterDebouncer.Subscribe
          selector={(state) => ({
            isPending: state.isPending,
            executionCount: state.executionCount,
          })}
          >{#snippet children({ isPending, executionCount })}<tr
              ><td>Is Pending:</td><td>{isPending.toString()}</td></tr
            ><tr><td>Execution Count:</td><td>{executionCount}</td></tr><tr
              ><td colspan={2}><hr /></td></tr
            ><tr><td>Instant Count:</td><td>{instantCount}</td></tr><tr
              ><td>Debounced Count:</td><td>{debouncedCount()}</td></tr
            >{/snippet}</counterDebouncer.Subscribe
        ></tbody
      >
    </table>
    <div><button onclick={increment}>Increment</button></div>
    <counterDebouncer.Subscribe selector={(state) => state}
      >{#snippet children(state)}<pre style="margin-top: 20px">{JSON.stringify(
            state,
            null,
            2,
          )}</pre>{/snippet}</counterDebouncer.Subscribe
    >
  </div>
  <hr />
  <div>
    <h1>TanStack Pacer createDebouncedSignal Example 2</h1>
    <div>
      <input
        type="search"
        value={instantSearch}
        oninput={handleSearchChange}
        placeholder="Type to search..."
        style="width: 100%"
      />
    </div>
    <table>
      <tbody
        ><searchDebouncer.Subscribe
          selector={(state) => ({
            isPending: state.isPending,
            executionCount: state.executionCount,
          })}
          >{#snippet children({ isPending, executionCount })}<tr
              ><td>Is Pending:</td><td>{isPending.toString()}</td></tr
            ><tr><td>Execution Count:</td><td>{executionCount}</td></tr><tr
              ><td colspan={2}><hr /></td></tr
            ><tr><td>Instant Search:</td><td>{instantSearch}</td></tr><tr
              ><td>Debounced Search:</td><td>{debouncedSearch()}</td></tr
            >{/snippet}</searchDebouncer.Subscribe
        ></tbody
      >
    </table>
    <searchDebouncer.Subscribe selector={(state) => state}
      >{#snippet children(state)}<pre style="margin-top: 20px">{JSON.stringify(
            state,
            null,
            2,
          )}</pre>{/snippet}</searchDebouncer.Subscribe
    >
  </div>
  <hr />
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
        ><rangeDebouncer.Subscribe
          selector={(state) => ({
            isPending: state.isPending,
            executionCount: state.executionCount,
          })}
          >{#snippet children({ isPending, executionCount })}<tr
              ><td>Is Pending:</td><td>{isPending.toString()}</td></tr
            ><tr
              ><td>Instant Executions:</td><td>{instantExecutionCount}</td></tr
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
            >{/snippet}</rangeDebouncer.Subscribe
        ></tbody
      >
    </table>
    <div style="color: #666; font-size: 0.9em">
      <p>Debounced to 250ms wait time</p>
    </div>
    <rangeDebouncer.Subscribe selector={(state) => state}
      >{#snippet children(state)}<pre style="margin-top: 20px">{JSON.stringify(
            state,
            null,
            2,
          )}</pre>{/snippet}</rangeDebouncer.Subscribe
    >
  </div>
</div>
{#if import.meta.env.DEV}<TanStackDevtools
    plugins={[pacerDevtoolsPlugin()]}
  />{/if}
