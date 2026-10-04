<script setup lang="ts">
import { ref } from 'vue'
import { throttle } from '@tanstack/vue-pacer/throttler'

const text = ref('')

const throttledText = ref('')

// Create throttled setter function - Stable reference required!
const throttledSetText = throttle(
  (value: typeof throttledText.value) => (throttledText.value = value),
  {
    wait: 1000,
  },
)

function handleTextChange(e: Event) {
  const newValue = (e.target as HTMLInputElement).value
  text.value = newValue
  throttledSetText(newValue)
}
</script>
<template>
  <div>
    <h1>TanStack Pacer throttle Example 2</h1>
    <div>
      <input
        type="search"
        :value="text"
        @input="handleTextChange"
        placeholder="Type text (throttled to 1 update per second)..."
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
          <td>Throttled Text:</td>
          <td>{{ throttledText }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
