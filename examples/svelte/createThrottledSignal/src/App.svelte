<script lang="ts">
  import { TanStackDevtools } from '@tanstack/svelte-devtools'
  import { pacerDevtoolsPlugin } from '@tanstack/svelte-pacer-devtools'
  import { untrack } from 'svelte'
  import { createThrottledSignal } from '@tanstack/svelte-pacer/throttler'

  let instantCount = $state(0)

  let instantCountRef = $state(0)

  const [throttledCount, setThrottledCount, counterThrottler] =
    createThrottledSignal(
      untrack(() => instantCount),
      () => ({
        wait: 1000,
        // enabled: () => instantCount > 2, // optional, defaults to true
      }),
    )

  function increment() {
    const nextCount = ++instantCountRef
    instantCount = nextCount
    setThrottledCount(nextCount)
  }

  let instantExecutionCount = $state(0)

  let currentValue = $state(50)

  const [throttledValue, setThrottledValue, rangeThrottler] =
    createThrottledSignal(
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

  let instantSearch = $state('')

  const [throttledSearch, setThrottledSearch, searchThrottler] =
    createThrottledSignal(
      untrack(() => instantSearch),
      () => ({
        wait: 1000,
        // enabled: () => instantSearch.length > 2, // optional, defaults to true
      }),
    )

  function handleSearchChange(e: Event) {
    const newValue = (e.target as HTMLInputElement).value

    instantSearch = newValue
    setThrottledSearch(newValue)
  }
</script>

<div>
  <div>
    <h1>TanStack Pacer createThrottledSignal Example 1</h1>
    <table>
      <tbody
        ><counterThrottler.Subscribe
          selector={(state) => ({ executionCount: state.executionCount })}
          >{#snippet children({ executionCount })}<tr
              ><td>Execution Count:</td><td>{executionCount}</td></tr
            ><tr><td>Instant Count:</td><td>{instantCount}</td></tr><tr
              ><td>Throttled Count:</td><td>{throttledCount()}</td></tr
            >{/snippet}</counterThrottler.Subscribe
        ></tbody
      >
    </table>
    <div><button onclick={increment}>Increment</button></div>
    <counterThrottler.Subscribe selector={(state) => state}
      >{#snippet children(state)}<pre style="margin-top: 20px">{JSON.stringify(
            state,
            null,
            2,
          )}</pre>{/snippet}</counterThrottler.Subscribe
    >
  </div>
  <hr />
  <div>
    <h1>TanStack Pacer createThrottledSignal Example 2</h1>
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
        ><searchThrottler.Subscribe
          selector={(state) => ({ executionCount: state.executionCount })}
          >{#snippet children({ executionCount })}<tr
              ><td>Execution Count:</td><td>{executionCount}</td></tr
            ><tr><td>Instant Search:</td><td>{instantSearch}</td></tr><tr
              ><td>Throttled Search:</td><td>{throttledSearch()}</td></tr
            >{/snippet}</searchThrottler.Subscribe
        ></tbody
      >
    </table>
    <searchThrottler.Subscribe selector={(state) => state}
      >{#snippet children(state)}<pre style="margin-top: 20px">{JSON.stringify(
            state,
            null,
            2,
          )}</pre>{/snippet}</searchThrottler.Subscribe
    >
  </div>
  <hr />
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
        ><rangeThrottler.Subscribe
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
            >{/snippet}</rangeThrottler.Subscribe
        ></tbody
      >
    </table>
    <div style="color: #666; font-size: 0.9em">
      <p>Throttled to 1 update per 250ms</p>
    </div>
    <rangeThrottler.Subscribe selector={(state) => state}
      >{#snippet children(state)}<pre style="margin-top: 20px">{JSON.stringify(
            state,
            null,
            2,
          )}</pre>{/snippet}</rangeThrottler.Subscribe
    >
  </div>
</div>
{#if import.meta.env.DEV}<TanStackDevtools
    plugins={[pacerDevtoolsPlugin()]}
  />{/if}
