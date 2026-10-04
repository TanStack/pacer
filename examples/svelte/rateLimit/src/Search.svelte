<script lang="ts">
  import { rateLimit } from '@tanstack/svelte-pacer/rate-limiter'

  let windowType = $state<'fixed' | 'sliding'>('fixed')

  let text = $state('')

  let rateLimitedText = $state('')

  // Create rate-limited setter function - Stable reference required!
  const rateLimitedSetText = $derived.by(() =>
    rateLimit((value: typeof rateLimitedText) => (rateLimitedText = value), {
      limit: 5,
      window: 5000,
      windowType: windowType,
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
  <h1>TanStack Pacer rateLimit Example 2</h1>
  <div style="display: grid; gap: 0.5rem; margin-bottom: 1rem">
    <label
      ><input
        type="radio"
        name="windowType2"
        value="fixed"
        checked={windowType === 'fixed'}
        oninput={() => (windowType = 'fixed')}
      />Fixed Window</label
    ><label
      ><input
        type="radio"
        name="windowType2"
        value="sliding"
        checked={windowType === 'sliding'}
        oninput={() => (windowType = 'sliding')}
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
