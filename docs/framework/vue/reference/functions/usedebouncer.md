---
title: useDebouncer
id: usedebouncer
---

# useDebouncer

A Vue composable that creates a debouncer instance with Vue reactivity integration. This composable provides a debounced value that updates only after a specified delay has passed since the last update.

## Usage

```vue
<script setup lang="ts">
import { computed, ref } from 'vue'
import { useDebouncer } from '@tanstack/vue-pacer'

// Create a debouncer with initial value and options
const { value, setValue, flush, cancel, isPending, executionCount, setOptions, getOptions } = useDebouncer('', {
  wait: 1000,
  leading: false,   // Don't execute on first call
  trailing: true,   // Execute after wait period
})

// Track time since last update
const lastUpdateTime = ref(Date.now())
const timeSinceUpdate = computed(() => {
  return Date.now() - lastUpdateTime.value
})

// Update handlers
function handleInput(event: Event) {
  const input = event.target as HTMLInputElement
  setValue(input.value)
}

function updateNow() {
  if (value.value !== undefined) {
    flush()
    lastUpdateTime.value = Date.now()
  }
}

function cancelUpdate() {
  cancel()
}
</script>

<template>
  <div>
    <div class="input-group">
      <label>Debounced input:</label>
      <input 
        :value="value"
        @input="handleInput"
        placeholder="Type here..."
      />
    </div>

    <div class="controls">
      <button 
        @click="cancelUpdate"
        :disabled="!isPending.value"
      >
        Cancel Update
      </button>
      <button 
        @click="updateNow"
        :disabled="!isPending.value"
      >
        Update Now
      </button>
    </div>

    <div class="values">
      <p><strong>Current value:</strong> {{ value }}</p>
      <p><strong>Status:</strong> 
        {{ isPending.value ? 'Update Pending...' : 'Up to date' }}
      </p>
      <p><strong>Time since update:</strong> {{ timeSinceUpdate }}ms</p>
    </div>
  </div>
</template>
```

## Type Declaration

```ts
function useDebouncer<TValue>(
  initialValue: MaybeRef<TValue>,
  options: DebouncerOptions<(value: TValue) => void>
): UseDebouncerReturn<TValue>
```

## Parameters

- `initialValue`: The initial value for the debouncer. Can be a raw value or a Vue ref.
- `options`: Configuration options for the debouncer
  - `wait`: The number of milliseconds to delay
  - `maxWait`: Optional maximum time the debouncer will wait before invoking
  - `leading`: Optional, if true the debouncer will invoke on the leading edge
  - `trailing`: Optional, if true the debouncer will invoke on the trailing edge
  - `enabled`: Optional, if false the debouncer will not execute (defaults to true)

## Returns

- `value`: A Vue ref containing the current debounced value
- `setValue`: Function to set a new value (will be debounced)
- `flush`: Function to force immediate update of the value
- `cancel`: Function to cancel any pending updates
- `isPending`: A computed ref indicating if there are any pending updates
- `executionCount`: A computed ref containing the number of times the value has been updated
- `setOptions`: Function to update debouncer options
- `getOptions`: Function to get current debouncer options
