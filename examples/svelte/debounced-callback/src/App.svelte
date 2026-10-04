<script lang="ts">
  import { TanStackDevtools } from '@tanstack/svelte-devtools'
  import { pacerDevtoolsPlugin } from '@tanstack/svelte-pacer-devtools'
  import { createDebouncer } from '@tanstack/svelte-pacer/debouncer'

  let instantCount = $state(0)

  let instantCountRef = $state(0)

  let debouncedCount = $state(0)

  const debouncedSetCount = createDebouncer(
    (value: typeof debouncedCount) => {
      debouncedCount = value
    },
    () => ({
      wait: 500,
      // enabled: () => instantCount > 2, // optional, defaults to true
      // leading: true, // optional, defaults to false
    }),
  ).maybeExecute

  function increment() {
    const nextCount = ++instantCountRef
    instantCount = nextCount
    debouncedSetCount(nextCount)
  }

  let currentValue = $state(50)

  let debouncedValue = $state(50)

  const debouncedSetValue = createDebouncer(
    (value: typeof debouncedValue) => {
      debouncedValue = value
    },
    () => ({
      wait: 250,
    }),
  ).maybeExecute

  function handleRangeChange(e: Event) {
    const newValue = parseInt((e.target as HTMLInputElement).value, 10)
    currentValue = newValue
    debouncedSetValue(newValue)
  }

  let searchText = $state('')

  let searchTextRef = $state('')

  let debouncedSearchText = $state('')

  const debouncedSetSearch = createDebouncer(
    (value: typeof debouncedSearchText) => {
      debouncedSearchText = value
    },
    () => ({
      wait: 500,
      enabled: () => searchTextRef.length > 2,
    }),
  ).maybeExecute

  function handleSearchChange(e: Event) {
    const newValue = (e.target as HTMLInputElement).value
    searchTextRef = newValue
    searchText = newValue
    debouncedSetSearch(newValue)
  }
</script>

<div>
  <div>
    <h1>TanStack Pacer createDebouncer Example 1</h1>
    <table>
      <tbody
        ><tr><td>Instant Count:</td><td>{instantCount}</td></tr><tr
          ><td>Debounced Count:</td><td>{debouncedCount}</td></tr
        ></tbody
      >
    </table>
    <div><button onclick={increment}>Increment</button></div>
  </div>
  <hr />
  <div>
    <h1>TanStack Pacer createDebouncer Example 2</h1>
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
          ><td>Debounced Search:</td><td>{debouncedSearchText}</td></tr
        ></tbody
      >
    </table>
  </div>
  <hr />
  <div>
    <h1>TanStack Pacer createDebouncer Example 3</h1>
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
          value={debouncedValue}
          disabled
          style="width: 100%"
        /><span>{debouncedValue}</span></label
      >
    </div>
    <div style="color: #666; font-size: 0.9em">
      <p>Debounced to 250ms wait time</p>
    </div>
  </div>
</div>
{#if import.meta.env.DEV}<TanStackDevtools
    plugins={[pacerDevtoolsPlugin()]}
  />{/if}
