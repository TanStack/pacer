---
title: useDebouncer
id: usedebouncer
---

# useDebouncer

A Vue composable that creates a debouncer instance with Vue reactivity integration. This composable provides a debounced value that updates only after a specified delay has passed since the last update.

## Usage

```vue
<script setup>
import { useDebouncer } from '@tanstack/vue-pacer'

const [debouncedValue, debouncer] = useDebouncer('initial', {
  wait: 500 // Wait 500ms after last change
})

// Update the value (will be debounced)
debouncer.set('new value')

// Access the current value
console.log(debouncedValue.value)

// Cancel pending updates
debouncer.cancel()
</script>
```

## Type Declaration

```ts
function useDebouncer<TValue>(
  initialValue: MaybeRef<TValue>,
  options: DebouncerOptions<(value: TValue) => void>
): [Ref<TValue>, VueDebouncer<TValue>]
```

## Parameters

- `initialValue`: The initial value for the debouncer. Can be a raw value or a Vue ref.
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
