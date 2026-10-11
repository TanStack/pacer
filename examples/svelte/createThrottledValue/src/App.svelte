<script lang="ts">
  import { TanStackDevtools } from '@tanstack/svelte-devtools'
  import { pacerDevtoolsPlugin } from '@tanstack/svelte-pacer-devtools'
  import { createThrottledValue } from '@tanstack/svelte-pacer/throttler'

  let instantCount = $state(0)

  function increment() {
    instantCount = instantCount + 1
  }

  const [throttledCount] = createThrottledValue(
    () => instantCount,
    () => ({
      wait: 1000,
      // enabled: () => instantCount > 2, // optional, defaults to true
    }),
  )

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

  let instantSearch = $state('')

  const [throttledSearch] = createThrottledValue(
    () => instantSearch,
    () => ({
      wait: 1000,
      // enabled: instantSearch.length > 2, // optional, defaults to true
    }),
  )

  function handleSearchChange(e: Event) {
    instantSearch = (e.target as HTMLInputElement).value
  }
</script>

<div>
  <div>
    <h1>TanStack Pacer createThrottledValue Example 1</h1>
    <table>
      <tbody
        ><tr><td>Instant Count:</td><td>{instantCount}</td></tr><tr
          ><td>Throttled Count:</td><td>{throttledCount()}</td></tr
        ></tbody
      >
    </table>
    <div><button onclick={increment}>Increment</button></div>
  </div>
  <hr />
  <div>
    <h1>TanStack Pacer createThrottledValue Example 2</h1>
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
        ><tr><td>Instant Search:</td><td>{instantSearch}</td></tr><tr
          ><td>Throttled Search:</td><td>{throttledSearch()}</td></tr
        ></tbody
      >
    </table>
  </div>
  <hr />
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
    <pre style="margin-top: 20px"><throttler.Subscribe
        selector={(state) => state}
        >{#snippet children(state)}{JSON.stringify(
            state,
            null,
            2,
          )}{/snippet}</throttler.Subscribe
      ></pre>
  </div>
</div>
{#if import.meta.env.DEV}<TanStackDevtools
    plugins={[pacerDevtoolsPlugin()]}
  />{/if}
