<script setup lang="ts">
import { ref } from 'vue'
import { debounce } from '@tanstack/vue-pacer/debouncer'

const instantValue = ref(50)

const debouncedValue = ref(50)

// Create debounced setter function - Stable reference required!
const debouncedSetValue = debounce(
  (value: typeof debouncedValue.value) => (debouncedValue.value = value),
  {
    wait: 250,
  },
)

function handleRangeChange(e: Event) {
  const newValue = parseInt((e.target as HTMLInputElement).value, 10)
  instantValue.value = newValue
  debouncedSetValue(newValue)
}
</script>
<template>
  <div>
    <h1>TanStack Pacer debounce Example 3</h1>
    <div :style="{ marginBottom: '20px' }">
      <label
        >Instant Range:<input
          type="range"
          min="0"
          max="100"
          :value="instantValue"
          @input="handleRangeChange"
          :style="{ width: '100%' }"
        /><span>{{ instantValue }}</span></label
      >
    </div>
    <div>
      <label
        >Debounced Range (Readonly):<input
          type="range"
          min="0"
          max="100"
          :value="debouncedValue"
          disabled
          :style="{ width: '100%' }"
        /><span>{{ debouncedValue }}</span></label
      >
    </div>
  </div>
</template>
