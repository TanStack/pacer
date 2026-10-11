<script lang="ts">
  import { TanStackDevtools } from '@tanstack/svelte-devtools'
  import { pacerDevtoolsPlugin } from '@tanstack/svelte-pacer-devtools'
  import { throttle } from '@tanstack/svelte-pacer/throttler'

  let instantCount = $state(0)

  let throttledCount = $state(0)

  // Create throttled setter function - Stable reference required!
  const throttledSetCount = throttle(
    (value: typeof throttledCount) => (throttledCount = value),
    {
      wait: 1000,
    },
  )

  function increment() {
    // this pattern helps avoid common bugs with stale closures and state
    instantCount = ((c) => {
      const newInstantCount = c + 1 // common new value for both
      throttledSetCount(newInstantCount) // throttled state update
      return newInstantCount // instant state update
    })(instantCount)
  }

  let currentValue = $state(50)

  let throttledValue = $state(50)

  let instantExecutionCount = $state(0)

  // Create throttled setter function - Stable reference required!
  const throttledSetValue = throttle(
    (value: typeof throttledValue) => (throttledValue = value),
    {
      wait: 250,
    },
  )

  function handleRangeChange(e: Event) {
    const newValue = parseInt((e.target as HTMLInputElement).value, 10)
    currentValue = newValue
    instantExecutionCount = instantExecutionCount + 1
    throttledSetValue(newValue)
  }

  let text = $state('')

  let throttledText = $state('')

  // Create throttled setter function - Stable reference required!
  const throttledSetText = throttle(
    (value: typeof throttledText) => (throttledText = value),
    {
      wait: 1000,
    },
  )

  function handleTextChange(e: Event) {
    const newValue = (e.target as HTMLInputElement).value
    text = newValue
    throttledSetText(newValue)
  }
</script>

<div>
  <div>
    <h1>TanStack Pacer throttle Example 1</h1>
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
    <h1>TanStack Pacer throttle Example 2</h1>
    <div>
      <input
        type="search"
        value={text}
        oninput={handleTextChange}
        placeholder="Type text (throttled to 1 update per second)..."
        style="width: 100%"
      />
    </div>
    <table>
      <tbody
        ><tr><td>Instant Text:</td><td>{text}</td></tr><tr
          ><td>Throttled Text:</td><td>{throttledText}</td></tr
        ></tbody
      >
    </table>
  </div>
  <hr />
  <div>
    <h1>TanStack Pacer throttle Example 3</h1>
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
        ><tr><td>Instant Executions:</td><td>{instantExecutionCount}</td></tr
        ></tbody
      >
    </table>
    <div style="color: #666; font-size: 0.9em">
      <p>Throttled with 250ms wait time</p>
    </div>
  </div>
</div>
{#if import.meta.env.DEV}<TanStackDevtools
    plugins={[pacerDevtoolsPlugin()]}
  />{/if}
