<script lang="ts">
  import { TanStackDevtools } from '@tanstack/svelte-devtools'
  import { pacerDevtoolsPlugin } from '@tanstack/svelte-pacer-devtools'
  import { createThrottler } from '@tanstack/svelte-pacer/throttler'

  let instantCount = $state(0)

  let instantCountRef = $state(0)

  let throttledCount = $state(0)

  const throttledSetCount = createThrottler(
    (value: typeof throttledCount) => {
      throttledCount = value
    },
    () => ({
      wait: 1000,
      enabled: () => instantCountRef > 2,
    }),
  ).maybeExecute

  function increment() {
    const nextCount = ++instantCountRef
    instantCount = nextCount
    throttledSetCount(nextCount)
  }

  let currentValue = $state(50)

  let throttledValue = $state(50)

  const throttledSetValue = createThrottler(
    (value: typeof throttledValue) => {
      throttledValue = value
    },
    () => ({
      wait: 250,
    }),
  ).maybeExecute

  function handleRangeChange(e: Event) {
    const newValue = parseInt((e.target as HTMLInputElement).value, 10)
    currentValue = newValue
    throttledSetValue(newValue)
  }

  let searchText = $state('')

  let searchTextRef = $state('')

  let throttledSearchText = $state('')

  const throttledSetSearch = createThrottler(
    (value: typeof throttledSearchText) => {
      throttledSearchText = value
    },
    () => ({
      wait: 1000,
      enabled: () => searchTextRef.length > 2,
    }),
  ).maybeExecute

  function handleSearchChange(e: Event) {
    const newValue = (e.target as HTMLInputElement).value
    searchTextRef = newValue
    searchText = newValue
    throttledSetSearch(newValue)
  }
</script>

<div>
  <div>
    <h1>TanStack Pacer createThrottler Example 1</h1>
    <table>
      <tbody
        ><tr><td>Instant Count:</td><td>{instantCount}</td></tr><tr
          ><td>Throttled Count:</td><td>{throttledCount}</td></tr
        ></tbody
      >
    </table>
    <div><button onclick={increment}>Increment</button></div>
  </div>
  <hr />
  <div>
    <h1>TanStack Pacer createThrottler Example 2</h1>
    <div>
      <input
        type="search"
        value={searchText}
        oninput={handleSearchChange}
        placeholder="Type to search..."
        style="width: 100%"
      />
    </div>
    <table>
      <tbody
        ><tr><td>Instant Search:</td><td>{searchText}</td></tr><tr
          ><td>Throttled Search:</td><td>{throttledSearchText}</td></tr
        ></tbody
      >
    </table>
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
    <div style="color: #666; font-size: 0.9em">
      <p>Throttled to 1 update per 250ms</p>
    </div>
  </div>
</div>
{#if import.meta.env.DEV}<TanStackDevtools
    plugins={[pacerDevtoolsPlugin()]}
  />{/if}
