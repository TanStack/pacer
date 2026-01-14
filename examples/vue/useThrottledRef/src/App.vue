<script setup lang="ts">
import { ref } from 'vue'
import { useThrottledRef } from '@tanstack/vue-pacer/throttler'

const instantValue = ref('')

const [throttledValue, setThrottledValue, throttler] = useThrottledRef(
  '',
  { wait: 500 },
  (state) => ({
    isPending: state.isPending,
    executionCount: state.executionCount,
    status: state.status,
  }),
)

function handleInput(e: Event) {
  const target = e.target as HTMLInputElement
  instantValue.value = target.value
  setThrottledValue(target.value)
}
</script>

<template>
  <div style="padding: 20px; font-family: sans-serif">
    <h1>useThrottledRef Example</h1>

    <div style="margin-bottom: 20px">
      <label for="search">Search: </label>
      <input
        id="search"
        type="text"
        :value="instantValue"
        @input="handleInput"
        placeholder="Type to search..."
        style="padding: 8px; font-size: 16px; width: 300px"
      />
    </div>

    <div style="margin-bottom: 20px">
      <h3>Values</h3>
      <p><strong>Instant Value:</strong> "{{ instantValue }}"</p>
      <p><strong>Throttled Value:</strong> "{{ throttledValue }}"</p>
    </div>

    <div style="margin-bottom: 20px">
      <h3>Throttler State</h3>
      <p><strong>Status:</strong> {{ throttler.state.value.status }}</p>
      <p><strong>Is Pending:</strong> {{ throttler.state.value.isPending }}</p>
      <p>
        <strong>Execution Count:</strong>
        {{ throttler.state.value.executionCount }}
      </p>
    </div>

    <div>
      <h3>How it works</h3>
      <p>
        The instant value updates immediately as you type, while the throttled
        value updates at most once every 500ms.
      </p>
    </div>
  </div>
</template>
