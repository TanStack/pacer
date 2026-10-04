<script setup lang="ts">
import { ref } from 'vue'
import { useRateLimiter } from '@tanstack/vue-pacer/rate-limiter'

const windowType = ref<'fixed' | 'sliding'>('fixed')

const currentValue = ref(50)

const limitedValue = ref(50)

const rateLimitedSetValue = useRateLimiter(
  (value: typeof limitedValue.value) => {
    limitedValue.value = value
  },
  () => ({
    limit: 20,
    window: 2000,
    windowType: windowType.value,
    onReject: (rateLimiter) => {
      console.log(
        `Rate limit reached. Try again in ${rateLimiter.getMsUntilNextWindow()}ms`,
      )
    },
  }),
).maybeExecute

function handleRangeChange(e: Event) {
  const newValue = parseInt((e.target as HTMLInputElement).value, 10)
  currentValue.value = newValue
  rateLimitedSetValue(newValue)
}
</script>
<template>
  <div>
    <h1>TanStack Pacer useRateLimiter Example 3</h1>
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
          :value="limitedValue"
          disabled
          :style="{ width: '100%' }"
        /><span>{{ limitedValue }}</span></label
      >
    </div>
    <div :style="{ color: '#666', fontSize: '0.9em' }">
      <p>Rate limited to 20 updates per 2 seconds</p>
    </div>
  </div>
</template>
