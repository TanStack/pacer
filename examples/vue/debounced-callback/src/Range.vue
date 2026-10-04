<script setup lang="ts">
import { ref } from 'vue'
import { useDebouncer } from '@tanstack/vue-pacer/debouncer'

const currentValue = ref(50)

const debouncedValue = ref(50)

const debouncedSetValue = useDebouncer(
  (value: typeof debouncedValue.value) => {
    debouncedValue.value = value
  },
  () => ({
    wait: 250,
  }),
).maybeExecute

function handleRangeChange(e: Event) {
  const newValue = parseInt((e.target as HTMLInputElement).value, 10)
  currentValue.value = newValue
  debouncedSetValue(newValue)
}
</script>
<template>
  <div>
    <h1>TanStack Pacer useDebouncer Example 3</h1>
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
    <div :style="{ color: '#666', fontSize: '0.9em' }">
      <p>Debounced to 250ms wait time</p>
    </div>
  </div>
</template>
