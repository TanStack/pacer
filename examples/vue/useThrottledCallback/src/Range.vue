<script setup lang="ts">
import { ref } from 'vue'
import { useThrottledCallback } from '@tanstack/vue-pacer/throttler'

const currentValue = ref(50)

const throttledValue = ref(50)

const throttledSetValue = useThrottledCallback(
  (value: typeof throttledValue.value) => {
    throttledValue.value = value
  },
  () => ({
    wait: 250,
  }),
)

function handleRangeChange(e: Event) {
  const newValue = parseInt((e.target as HTMLInputElement).value, 10)
  currentValue.value = newValue
  throttledSetValue(newValue)
}
</script>
<template>
  <div>
    <h1>TanStack Pacer useThrottledCallback Example 3</h1>
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
        >Throttled Range (Readonly):<input
          type="range"
          min="0"
          max="100"
          :value="throttledValue"
          disabled
          :style="{ width: '100%' }"
        /><span>{{ throttledValue }}</span></label
      >
    </div>
    <div :style="{ color: '#666', fontSize: '0.9em' }">
      <p>Throttled to 1 update per 250ms</p>
    </div>
  </div>
</template>
