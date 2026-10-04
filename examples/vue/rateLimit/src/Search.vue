<script setup lang="ts">
import { computed, ref } from 'vue'
import { rateLimit } from '@tanstack/vue-pacer/rate-limiter'

const windowType = ref<'fixed' | 'sliding'>('fixed')

const text = ref('')

const rateLimitedText = ref('')

// Create rate-limited setter function - Stable reference required!
const rateLimitedSetText = computed(() =>
  rateLimit(
    (value: typeof rateLimitedText.value) => (rateLimitedText.value = value),
    {
      limit: 5,
      window: 5000,
      windowType: windowType.value,
      onReject: (rateLimiter) =>
        console.log(
          'Rejected by rate limiter',
          rateLimiter.getMsUntilNextWindow(),
        ),
    },
  ),
)

function handleTextChange(e: Event) {
  const newValue = (e.target as HTMLInputElement).value
  text.value = newValue
  rateLimitedSetText.value(newValue)
}
</script>
<template>
  <div>
    <h1>TanStack Pacer rateLimit Example 2</h1>
    <div :style="{ display: 'grid', gap: '0.5rem', marginBottom: '1rem' }">
      <label
        ><input
          type="radio"
          name="windowType2"
          value="fixed"
          :checked="windowType === 'fixed'"
          @input="() => (windowType = 'fixed')"
        />Fixed Window</label
      ><label
        ><input
          type="radio"
          name="windowType2"
          value="sliding"
          :checked="windowType === 'sliding'"
          @input="() => (windowType = 'sliding')"
        />Sliding Window</label
      >
    </div>
    <div>
      <input
        type="search"
        :value="text"
        @input="handleTextChange"
        placeholder="Type text (rate limited to 5 updates per 5 seconds)..."
        :style="{ width: '100%' }"
      />
    </div>
    <table>
      <tbody>
        <tr>
          <td>Instant Text:</td>
          <td>{{ text }}</td>
        </tr>
        <tr>
          <td>Rate Limited Text:</td>
          <td>{{ rateLimitedText }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
