---
title: useDebouncedValue
id: usedebouncedvalue
---

# useDebouncedValue

A Vue composable that creates a debounced value that updates only after a specified delay. This composable automatically tracks changes to the input value and updates the debounced value accordingly.

## Usage

```vue
<script setup>
import { ref } from 'vue'
import { useDebouncedValue } from '@tanstack/vue-pacer'

const searchQuery = ref('')
const [debouncedQuery, debouncer] = useDebouncedValue(searchQuery, {
  wait: 500 // Wait 500ms after last change
})

// debouncedQuery will update 500ms after searchQuery stops changing
watch(debouncedQuery, async (newValue) => {
  const results = await fetchSearchResults(newValue)
  // Update UI with results
})

// The source value can be updated directly
searchQuery.value = 'new search'

// Or you can use the debouncer methods
debouncer.set('another search')
debouncer.cancel() // Cancel pending updates
</script>

<template>
  <div>
    <input v-model="searchQuery" />
    <p>Debounced query: {{ debouncedQuery }}</p>
  </div>
</template>
```

## Type Declaration

```ts
function useDebouncedValue<TValue>(
  value: MaybeRefOrGetter<TValue>,
  options: DebouncerOptions<(value: TValue) => void>
): [Ref<TValue>, VueDebouncer<TValue>]
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

Returns a tuple containing:
1. A Vue ref containing the current debounced value
2. A debouncer instance with the following methods:
   - `set(value)`: Update the debounced value
   - `cancel()`: Cancel any pending debounced invocations
   - `flush()`: Immediately invoke any pending debounced invocations
   - `isPending()`: Check if there are any pending invocations
   - `value`: Get the current debounced value
