<script lang="ts">
  import { rateLimit } from '@tanstack/svelte-pacer/rate-limiter'

  let windowType = $state<'fixed' | 'sliding'>('fixed')

  let currentValue = $state(50)

  let rateLimitedValue = $state(50)

  // Create rate-limited setter function - Stable reference required!
  const rateLimitedSetValue = $derived.by(() =>
    rateLimit((value: typeof rateLimitedValue) => (rateLimitedValue = value), {
      limit: 30,
      window: 2000,
      windowType: windowType,
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
</script>

<div>
  <h1>TanStack Pacer rateLimit Example 3</h1>
  <div style="display: grid; gap: 0.5rem; margin-bottom: 1rem">
    <label
      ><input
        type="radio"
        name="windowType3"
        value="fixed"
        checked={windowType === 'fixed'}
        oninput={() => (windowType = 'fixed')}
      />Fixed Window</label
    ><label
      ><input
        type="radio"
        name="windowType3"
        value="sliding"
        checked={windowType === 'sliding'}
        oninput={() => (windowType = 'sliding')}
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
