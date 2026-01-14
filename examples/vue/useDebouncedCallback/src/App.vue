<script setup lang="ts">
import { ref } from 'vue'
import { useDebouncedCallback } from '@tanstack/vue-pacer/debouncer'

const instantValue = ref('')
const debouncedValue = ref('')
const callCount = ref(0)

const [debouncedUpdate, debouncer] = useDebouncedCallback(
  (value: string) => {
    debouncedValue.value = value
    callCount.value++
    console.log('Debounced callback executed with:', value)
  },
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
  debouncedUpdate(target.value)
}
</script>

<template>
  <div style="padding: 20px; font-family: sans-serif">
    <h1>useDebouncedCallback Example</h1>

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
      <p><strong>Debounced Value:</strong> "{{ debouncedValue }}"</p>
      <p><strong>Callback Executions:</strong> {{ callCount }}</p>
    </div>

    <div style="margin-bottom: 20px">
      <h3>Debouncer State</h3>
      <p><strong>Status:</strong> {{ debouncer.state.value.status }}</p>
      <p><strong>Is Pending:</strong> {{ debouncer.state.value.isPending }}</p>
      <p>
        <strong>Execution Count:</strong>
        {{ debouncer.state.value.executionCount }}
      </p>
    </div>

    <div>
      <h3>How it works</h3>
      <p>
        The instant value updates immediately as you type, while the debounced
        callback only executes 500ms after you stop typing. Check the console
        for log output.
      </p>
    </div>
  </div>
</template>
