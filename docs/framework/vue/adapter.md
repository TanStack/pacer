---
title: TanStack Pacer Vue Adapter
id: adapter
---

If you are using TanStack Pacer in a Vue application, we recommend using the Vue Adapter. The Vue Adapter provides a set of easy-to-use composables on top of the core Pacer utilities. If you find yourself wanting to use the core Pacer classes/functions directly, the Vue Adapter will also re-export everything from the core package.

## Installation

```sh
npm install @tanstack/vue-pacer
```

## Vue Composables

See the [Vue Functions Reference](./reference/index.md) to see the full list of composables available in the Vue Adapter.

## Basic Usage

Import a Vue specific composable from the Vue Adapter.

```vue
<script setup>
import { ref } from 'vue'
import { useDebouncedValue } from '@tanstack/vue-pacer'

const instantValue = ref(0)
const [debouncedValue, debouncer] = useDebouncedValue(instantValue, {
  wait: 1000,
})
</script>
```

Or import a core Pacer class/function that is re-exported from the Vue Adapter.

```ts
import { debounce, Debouncer } from '@tanstack/vue-pacer' // no need to install the core package separately
```
