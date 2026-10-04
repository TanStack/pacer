<script lang="ts">
  import { createRateLimiter } from '@tanstack/svelte-pacer/rate-limiter'

  let windowType = $state<'fixed' | 'sliding'>('fixed')

  let currentValue = $state(50)

  let limitedValue = $state(50)

  const rateLimitedSetValue = createRateLimiter(
    (value: typeof limitedValue) => {
      limitedValue = value
    },
    () => ({
      limit: 20,
      window: 2000,
      windowType: windowType,
      onReject: (rateLimiter) => {
        console.log(
          `Rate limit reached. Try again in ${rateLimiter.getMsUntilNextWindow()}ms`,
        )
      },
    }),
  ).maybeExecute

  function handleRangeChange(e: Event) {
    const newValue = parseInt((e.target as HTMLInputElement).value, 10)
    currentValue = newValue
    rateLimitedSetValue(newValue)
  }
</script>

<div>
  <h1>TanStack Pacer createRateLimiter Example 3</h1>
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
        value={limitedValue}
        disabled
        style="width: 100%"
      /><span>{limitedValue}</span></label
    >
  </div>
  <div style="color: #666; font-size: 0.9em">
    <p>Rate limited to 20 updates per 2 seconds</p>
  </div>
</div>
