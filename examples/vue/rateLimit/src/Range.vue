<script setup lang="ts">
import { computed, ref } from 'vue'
import { rateLimit } from '@tanstack/vue-pacer/rate-limiter'

const windowType = ref<'fixed' | 'sliding'>('fixed')

const currentValue = ref(50)

const rateLimitedValue = ref(50)

// Create rate-limited setter function - Stable reference required!
const rateLimitedSetValue = computed(() =>
  rateLimit(
    (value: typeof rateLimitedValue.value) => (rateLimitedValue.value = value),
    {
      limit: 30,
      window: 2000,
      windowType: windowType.value,
      onReject: (rateLimiter) =>
        console.log(
          'Rejected by rate limiter',
          rateLimiter.getMsUntilNextWindow(),
        ),
    },
  ),
)

function handleRangeChange(e: Event) {
  const newValue = parseInt((e.target as HTMLInputElement).value, 10)
  currentValue.value = newValue
  rateLimitedSetValue.value(newValue)
}
</script>
<template>
  <div>
    <h1>TanStack Pacer rateLimit Example 3</h1>
    <div :style="{ display: 'grid', gap: '0.5rem', marginBottom: '1rem' }">
      <label
        ><input
          type="radio"
          name="windowType3"
          value="fixed"
          :checked="windowType === 'fixed'"
          @input="() => (windowType = 'fixed')"
        />Fixed Window</label
      ><label
        ><input
          type="radio"
          name="windowType3"
          value="sliding"
          :checked="windowType === 'sliding'"
          @input="() => (windowType = 'sliding')"
        />Sliding Window</label
      >
    </div>
    <div :style="{ marginBottom: '20px' }">
      <label
        >Current Range:<input
          type="range"
          min="0"
          max="100"
          :value="currentValue"
          @input="handleRangeChange"
          :style="{ width: '100%' }"
        /><span>{{ currentValue }}</span></label
      >
    </div>
    <div :style="{ marginBottom: '20px' }">
      <label
        >Rate Limited Range (Readonly):<input
          type="range"
          min="0"
          max="100"
          :value="rateLimitedValue"
          disabled
          :style="{ width: '100%' }"
        /><span>{{ rateLimitedValue }}</span></label
      >
    </div>
    <div :style="{ color: '#666', fontSize: '0.9em' }">
      <p>Rate limited to 30 updates per 2000ms window</p>
    </div>
  </div>
</template>
