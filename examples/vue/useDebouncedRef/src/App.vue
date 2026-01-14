<script setup lang="ts">
import { ref } from 'vue'
import { useDebouncedRef } from '@tanstack/vue-pacer/debouncer'

const instantValue = ref('')

const [debouncedValue, setDebouncedValue, debouncer] = useDebouncedRef(
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
  setDebouncedValue(target.value)
}
</script>

<template>
  <div style="padding: 20px; font-family: sans-serif">
    <h1>useDebouncedRef Example</h1>

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
        value only updates 500ms after you stop typing.
      </p>
    </div>
  </div>
</template>
