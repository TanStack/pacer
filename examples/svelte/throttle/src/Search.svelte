<script lang="ts">
  import { throttle } from '@tanstack/svelte-pacer/throttler'

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
