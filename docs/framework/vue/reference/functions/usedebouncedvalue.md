---
title: useDebouncedValue
id: usedebouncedvalue
---

# useDebouncedValue

A Vue composable that creates a debounced value that updates only after a specified delay. This composable automatically tracks changes to the input value and updates the debounced value accordingly.

## Usage

```vue
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useDebouncedValue } from '@tanstack/vue-pacer'

// Basic debouncing example
const searchQuery = ref('')
const updateCount = ref(0)
const lastUpdateTime = ref(Date.now())

const { value: debouncedQuery } = useDebouncedValue(searchQuery, {
  wait: 500
})

// Compute time since last update
const timeSinceUpdate = computed(() => {
  return Date.now() - lastUpdateTime.value
})

// Watch for debounced updates
watch(debouncedQuery, () => {
  updateCount.value++
  lastUpdateTime.value = Date.now()
})

// Advanced example with controls
const controlledValue = ref('')
const { value: debouncedControlled, ...controlledDebouncer } = useDebouncedValue(
  controlledValue,
  {
    wait: 1000,
    leading: false,  // Don't execute on first call
    trailing: true,  // Execute after wait period
  }
)
</script>

<template>
  <div>
    <!-- Basic Example -->
    <div>
      <input v-model="searchQuery" placeholder="Type here..." />
      <p><strong>Instant value:</strong> {{ searchQuery }}</p>
      <p><strong>Debounced value:</strong> {{ debouncedQuery }}</p>
      <p><strong>Update count:</strong> {{ updateCount }}</p>
      <p><strong>Time since last update:</strong> {{ timeSinceUpdate }}ms</p>
    </div>

    <!-- Advanced Example with Controls -->
    <div>
      <input v-model="controlledValue" placeholder="Type and use controls..." />
      <button 
        @click="controlledDebouncer.cancel()"
        :disabled="!controlledDebouncer.isPending.value"
      >
        Cancel Update
      </button>
      <button 
        @click="controlledDebouncer.flush()"
        :disabled="!controlledDebouncer.isPending.value"
      >
        Update Now
      </button>
      <p><strong>Status:</strong> 
        {{ controlledDebouncer.isPending.value ? 'Update Pending...' : 'Up to date' }}
      </p>
    </div>
  </div>
</template>
```

## Type Declaration

```ts
function useDebouncedValue<TValue>(
  value: MaybeRefOrGetter<TValue>,
  options: DebouncerOptions<(value: TValue) => void>
): UseDebouncedValueReturn<TValue>
```

## Parameters

- `value`: The value to debounce. Can be:
  - A raw value
  - A Vue ref
  - A getter function
- `options`: Configuration options for the debouncer
  - `wait`: The number of milliseconds to delay
  - `maxWait`: Optional maximum time the debouncer will wait before invoking
  - `leading`: Optional, if true the debouncer will invoke on the leading edge
  - `trailing`: Optional, if true the debouncer will invoke on the trailing edge

## Returns

Returns an object containing:
- `value`: A Vue ref containing the current debounced value
- `flush()`: Immediately invoke any pending debounced invocations
- `cancel()`: Cancel any pending debounced invocations
- `isPending`: A Vue ref indicating if there are pending updates
