<script lang="ts">
  import { TanStackDevtools } from '@tanstack/svelte-devtools'
  import { pacerDevtoolsPlugin } from '@tanstack/svelte-pacer-devtools'
  import { createThrottler } from '@tanstack/svelte-pacer/throttler'

  let instantCount = $state(0)

  let throttledCount = $state(0)

  const setCountThrottler = createThrottler(
    (value: typeof throttledCount) => {
      throttledCount = value
    },
    () => ({
      key: 'counter',
      wait: 1000,
      // leading: true, // default
      // trailing: true, // default
      // enabled: () => instantCount > 2,
    }),
  )

  function increment() {
    const nextCount = ++instantCount
    setCountThrottler.maybeExecute(nextCount)
  }

  let instantExecutionCount = $state(0)

  let currentValue = $state(50)

  let throttledValue = $state(50)

  const setValueThrottler = createThrottler(
    (value: typeof throttledValue) => {
      throttledValue = value
    },
    () => ({
      key: 'range',
      wait: 250,
      // leading: true, // default
      // trailing: true, // default
    }),
  )

  function handleRangeChange(e: Event) {
    const newValue = parseInt((e.target as HTMLInputElement).value, 10)
    // instant state update
    currentValue = newValue
    instantExecutionCount = instantExecutionCount + 1
    // throttled state update
    setValueThrottler.maybeExecute(newValue)
  }

  let instantSearch = $state('')

  let throttledSearch = $state('')

  const setSearchThrottler = createThrottler(
    (value: typeof throttledSearch) => {
      throttledSearch = value
    },
    () => ({
      key: 'search',
      wait: 1000,
      enabled: () => instantSearch.length > 2,
    }),
  )

  function handleSearchChange(e: Event) {
    const newValue = (e.target as HTMLInputElement).value
    instantSearch = newValue
    setSearchThrottler.maybeExecute(newValue)
  }
</script>

<div>
  <div>
    <h1>TanStack Pacer createThrottler Example 1</h1>
    <table>
      <tbody
        ><setCountThrottler.Subscribe
          selector={(state) => ({ executionCount: state.executionCount })}
          >{#snippet children({ executionCount })}<tr
              ><td>Execution Count:</td><td>{executionCount}</td></tr
            ><tr><td>Instant Count:</td><td>{instantCount}</td></tr><tr
              ><td>Throttled Count:</td><td>{throttledCount}</td></tr
            >{/snippet}</setCountThrottler.Subscribe
        ></tbody
      >
    </table>
    <div>
      <button onclick={increment}>Increment</button><button
        onclick={() => setCountThrottler.flush()}
        style="margin-left: 10px"
      >
        Flush
      </button>
    </div>
    <setCountThrottler.Subscribe selector={(state) => state}
      >{#snippet children(state)}<pre style="margin-top: 20px">{JSON.stringify(
            state,
            null,
            2,
          )}</pre>{/snippet}</setCountThrottler.Subscribe
    >
  </div>
  <hr />
  <div>
    <h1>TanStack Pacer createThrottler Example 2</h1>
    <div>
      <!-- svelte-ignore a11y_autofocus: Focus the search field in this standalone demo. -->
      <input
        autofocus
        type="search"
        value={instantSearch}
        oninput={handleSearchChange}
        placeholder="Type to search..."
        style="width: 100%"
      />
    </div>
    <table>
      <tbody
        ><setSearchThrottler.Subscribe
          selector={(state) => ({ executionCount: state.executionCount })}
          >{#snippet children({ executionCount })}<tr
              ><td>Execution Count:</td><td>{executionCount}</td></tr
            ><tr><td>Instant Search:</td><td>{instantSearch}</td></tr><tr
              ><td>Throttled Search:</td><td>{throttledSearch}</td></tr
            >{/snippet}</setSearchThrottler.Subscribe
        ></tbody
      >
    </table>
    <div><button onclick={() => setSearchThrottler.flush()}>Flush</button></div>
    <setSearchThrottler.Subscribe selector={(state) => state}
      >{#snippet children(state)}<pre style="margin-top: 20px">{JSON.stringify(
            state,
            null,
            2,
          )}</pre>{/snippet}</setSearchThrottler.Subscribe
    >
  </div>
  <hr />
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
    <table>
      <tbody
        ><setValueThrottler.Subscribe
          selector={(state) => ({ executionCount: state.executionCount })}
          >{#snippet children({ executionCount })}<tr
              ><td>Instant Execution Count:</td><td>{instantExecutionCount}</td
              ></tr
            ><tr
              ><td>Throttled Execution Count:</td><td>{executionCount}</td></tr
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
            >{/snippet}</setValueThrottler.Subscribe
        ></tbody
      >
    </table>
    <div style="color: #666; font-size: 0.9em">
      <p>Throttled to 1 update per 250ms (trailing edge)</p>
    </div>
    <div><button onclick={() => setValueThrottler.flush()}>Flush</button></div>
    <setValueThrottler.Subscribe selector={(state) => state}
      >{#snippet children(state)}<pre style="margin-top: 20px">{JSON.stringify(
            state,
            null,
            2,
          )}</pre>{/snippet}</setValueThrottler.Subscribe
    >
  </div>
</div>
{#if import.meta.env.DEV}<TanStackDevtools
    plugins={[pacerDevtoolsPlugin()]}
  />{/if}
