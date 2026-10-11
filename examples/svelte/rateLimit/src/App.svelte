<script lang="ts">
  import { TanStackDevtools } from '@tanstack/svelte-devtools'
  import { pacerDevtoolsPlugin } from '@tanstack/svelte-pacer-devtools'
  import { rateLimit } from '@tanstack/svelte-pacer/rate-limiter'

  let counterWindowType = $state<'fixed' | 'sliding'>('fixed')

  let instantCount = $state(0)

  let rateLimitedCount = $state(0)

  // Create rate-limited setter function - Stable reference required!
  const rateLimitedSetCount = $derived.by(() =>
    rateLimit((value: typeof rateLimitedCount) => (rateLimitedCount = value), {
      limit: 5,
      window: 5000,
      windowType: counterWindowType,
      onReject: (rateLimiter) =>
        console.log(
          'Rejected by rate limiter',
          rateLimiter.getMsUntilNextWindow(),
        ),
    }),
  )

  function increment() {
    // this pattern helps avoid common bugs with stale closures and state
    instantCount = ((c) => {
      const newInstantCount = c + 1 // common new value for both
      rateLimitedSetCount(newInstantCount) // rate-limited state update
      return newInstantCount // instant state update
    })(instantCount)
  }

  let rangeWindowType = $state<'fixed' | 'sliding'>('fixed')

  let currentValue = $state(50)

  let rateLimitedValue = $state(50)

  // Create rate-limited setter function - Stable reference required!
  const rateLimitedSetValue = $derived.by(() =>
    rateLimit((value: typeof rateLimitedValue) => (rateLimitedValue = value), {
      limit: 30,
      window: 2000,
      windowType: rangeWindowType,
      onReject: (rateLimiter) =>
        console.log(
          'Rejected by rate limiter',
          rateLimiter.getMsUntilNextWindow(),
        ),
    }),
  )

  function handleRangeChange(e: Event) {
    const newValue = parseInt((e.target as HTMLInputElement).value, 10)
    currentValue = newValue
    rateLimitedSetValue(newValue)
  }

  let searchWindowType = $state<'fixed' | 'sliding'>('fixed')

  let text = $state('')

  let rateLimitedText = $state('')

  // Create rate-limited setter function - Stable reference required!
  const rateLimitedSetText = $derived.by(() =>
    rateLimit((value: typeof rateLimitedText) => (rateLimitedText = value), {
      limit: 5,
      window: 5000,
      windowType: searchWindowType,
      onReject: (rateLimiter) =>
        console.log(
          'Rejected by rate limiter',
          rateLimiter.getMsUntilNextWindow(),
        ),
    }),
  )

  function handleTextChange(e: Event) {
    const newValue = (e.target as HTMLInputElement).value
    text = newValue
    rateLimitedSetText(newValue)
  }
</script>

<div>
  <div>
    <h1>TanStack Pacer rateLimit Example 1</h1>
    <div style="display: grid; gap: 0.5rem; margin-bottom: 1rem">
      <label
        ><input
          type="radio"
          name="counterWindowType"
          value="fixed"
          checked={counterWindowType === 'fixed'}
          oninput={() => (counterWindowType = 'fixed')}
        />Fixed Window</label
      ><label
        ><input
          type="radio"
          name="counterWindowType"
          value="sliding"
          checked={counterWindowType === 'sliding'}
          oninput={() => (counterWindowType = 'sliding')}
        />Sliding Window</label
      >
    </div>
    <table>
      <tbody
        ><tr><td>Instant Count:</td><td>{instantCount}</td></tr><tr
          ><td>Rate Limited Count:</td><td>{rateLimitedCount}</td></tr
        ></tbody
      >
    </table>
    <div><button onclick={increment}>Increment</button></div>
  </div>
  <hr />
  <div>
    <h1>TanStack Pacer rateLimit Example 2</h1>
    <div style="display: grid; gap: 0.5rem; margin-bottom: 1rem">
      <label
        ><input
          type="radio"
          name="windowType2"
          value="fixed"
          checked={searchWindowType === 'fixed'}
          oninput={() => (searchWindowType = 'fixed')}
        />Fixed Window</label
      ><label
        ><input
          type="radio"
          name="windowType2"
          value="sliding"
          checked={searchWindowType === 'sliding'}
          oninput={() => (searchWindowType = 'sliding')}
        />Sliding Window</label
      >
    </div>
    <div>
      <input
        type="search"
        value={text}
        oninput={handleTextChange}
        placeholder="Type text (rate limited to 5 updates per 5 seconds)..."
        style="width: 100%"
      />
    </div>
    <table>
      <tbody
        ><tr><td>Instant Text:</td><td>{text}</td></tr><tr
          ><td>Rate Limited Text:</td><td>{rateLimitedText}</td></tr
        ></tbody
      >
    </table>
  </div>
  <hr />
  <div>
    <h1>TanStack Pacer rateLimit Example 3</h1>
    <div style="display: grid; gap: 0.5rem; margin-bottom: 1rem">
      <label
        ><input
          type="radio"
          name="windowType3"
          value="fixed"
          checked={rangeWindowType === 'fixed'}
          oninput={() => (rangeWindowType = 'fixed')}
        />Fixed Window</label
      ><label
        ><input
          type="radio"
          name="windowType3"
          value="sliding"
          checked={rangeWindowType === 'sliding'}
          oninput={() => (rangeWindowType = 'sliding')}
        />Sliding Window</label
      >
    </div>
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
        >Rate Limited Range (Readonly):<input
          type="range"
          min="0"
          max="100"
          value={rateLimitedValue}
          disabled
          style="width: 100%"
        /><span>{rateLimitedValue}</span></label
      >
    </div>
    <div style="color: #666; font-size: 0.9em">
      <p>Rate limited to 30 updates per 2000ms window</p>
    </div>
  </div>
</div>
{#if import.meta.env.DEV}<TanStackDevtools
    plugins={[pacerDevtoolsPlugin()]}
  />{/if}
