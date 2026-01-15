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

Import a Vue-specific composable from the Vue Adapter.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useDebouncedValue } from '@tanstack/vue-pacer'

const instantValue = ref(0)
const { debouncedValue, debouncer } = useDebouncedValue(instantValue, {
  wait: 1000,
})
</script>
```

Or import a core Pacer class/function that is re-exported from the Vue Adapter.

```ts
import { debounce, Debouncer } from '@tanstack/vue-pacer' // no need to install the core package separately
```

## Option Helpers

If you want a type-safe way to define common options for pacer utilities, TanStack Pacer provides option helpers for each utility. These helpers can be used with Vue composables.

### Debouncer Options

```vue
<script setup lang="ts">
import { useDebouncer } from '@tanstack/vue-pacer'
import { debouncerOptions } from '@tanstack/pacer'

const commonDebouncerOptions = debouncerOptions({
  wait: 1000,
  leading: false,
  trailing: true,
})

const debouncer = useDebouncer(
  (query: string) => fetchSearchResults(query),
  { ...commonDebouncerOptions, key: 'searchDebouncer' }
)
</script>
```

### Queuer Options

```vue
<script setup lang="ts">
import { useQueuer } from '@tanstack/vue-pacer'
import { queuerOptions } from '@tanstack/pacer'

const commonQueuerOptions = queuerOptions({
  concurrency: 3,
  addItemsTo: 'back',
})

const queuer = useQueuer(
  (item: string) => processItem(item),
  { ...commonQueuerOptions, key: 'itemQueuer' }
)
</script>
```

### Rate Limiter Options

```vue
<script setup lang="ts">
import { useRateLimiter } from '@tanstack/vue-pacer'
import { rateLimiterOptions } from '@tanstack/pacer'

const commonRateLimiterOptions = rateLimiterOptions({
  limit: 5,
  window: 60000,
  windowType: 'sliding',
})

const rateLimiter = useRateLimiter(
  (data: string) => sendApiRequest(data),
  { ...commonRateLimiterOptions, key: 'apiRateLimiter' }
)
</script>
```

## Provider

The Vue Adapter provides a `PacerProvider` using Vue's provide/inject pattern that you can use to provide default options to all instances of pacer utilities within your component tree.

```vue
<script setup lang="ts">
import { providePacerOptions } from '@tanstack/vue-pacer'

// Set default options for vue-pacer instances
providePacerOptions({
  debouncer: { wait: 1000 },
  queuer: { concurrency: 3 },
  rateLimiter: { limit: 5, window: 60000 },
})
</script>

<template>
  <App />
</template>
```

All composables within the provider will automatically use these default options, which can be overridden on a per-composable basis.

## Subscribing to State

The Vue adapter supports subscribing to state changes in two ways:

### Using the Subscribe Component

Use the `Subscribe` component to subscribe to state changes deep in your component tree without needing to pass a selector to the composable. This is ideal when you want to subscribe to state in child components. The Subscribe component uses scoped slots.

```vue
<script setup lang="ts">
import { useRateLimiter } from '@tanstack/vue-pacer'

const rateLimiter = useRateLimiter(
  (data: string) => {
    return fetch('/api/endpoint', {
      method: 'POST',
      body: JSON.stringify({ data }),
    })
  },
  { limit: 5, window: 60000 }
)
</script>

<template>
  <div>
    <button @click="rateLimiter.maybeExecute('some data')">
      Submit
    </button>
    
    <rateLimiter.Subscribe
      :selector="(state) => ({ rejectionCount: state.rejectionCount })"
      v-slot="{ rejectionCount }"
    >
      <div>Rejections: {{ rejectionCount }}</div>
    </rateLimiter.Subscribe>
  </div>
</template>
```

### Using the Selector Parameter

The `selector` parameter allows you to specify which state changes will trigger reactive updates at the composable level, optimizing performance by preventing unnecessary updates when irrelevant state changes occur.

**By default, `composable.state` is empty (`{}`) as the selector is empty by default.** You must opt-in to state tracking by providing a selector function.

```vue
<script setup lang="ts">
import { useDebouncer } from '@tanstack/vue-pacer'

// Default behavior - no reactive state subscriptions
const debouncer1 = useDebouncer(
  (query: string) => fetchSearchResults(query),
  { wait: 500 }
)
console.log(debouncer1.state) // {}

// Opt-in to track isPending changes
const debouncer2 = useDebouncer(
  (query: string) => fetchSearchResults(query),
  { wait: 500 },
  (state) => ({ isPending: state.isPending })
)
console.log(debouncer2.state.isPending) // Reactive Ref value
</script>

<template>
  <input
    @input="(e) => debouncer2.maybeExecute((e.target as HTMLInputElement).value)"
    placeholder="Search..."
  />
</template>
```

For more details on state management and available state properties, see the individual guide pages for each utility (e.g., [Rate Limiting Guide](../../guides/rate-limiting.md), [Debouncing Guide](../../guides/debouncing.md)).

## Examples

### Debouncer Example

```vue
<script setup lang="ts">
import { useDebouncer } from '@tanstack/vue-pacer'

const debouncer = useDebouncer(
  (query: string) => {
    console.log('Searching for:', query)
    // Perform search
  },
  { wait: 500 }
)
</script>

<template>
  <input
    @input="(e) => debouncer.maybeExecute((e.target as HTMLInputElement).value)"
    placeholder="Search..."
  />
</template>
```

### Queuer Example

```vue
<script setup lang="ts">
import { useQueuer } from '@tanstack/vue-pacer'

const queuer = useQueuer(
  async (file: File) => {
    await uploadFile(file)
  },
  { concurrency: 3 }
)

function handleFileSelect(files: FileList) {
  Array.from(files).forEach((file) => {
    queuer.addItem(file)
  })
}
</script>

<template>
  <input
    type="file"
    multiple
    @change="(e) => {
      const target = e.target as HTMLInputElement
      if (target.files) {
        handleFileSelect(target.files)
      }
    }"
  />
</template>
```

### Rate Limiter Example

```vue
<script setup lang="ts">
import { useRateLimiter } from '@tanstack/vue-pacer'

const rateLimiter = useRateLimiter(
  (data: string) => {
    return fetch('/api/endpoint', {
      method: 'POST',
      body: JSON.stringify({ data }),
    })
  },
  {
    limit: 5,
    window: 60000,
    windowType: 'sliding',
    onReject: () => {
      alert('Rate limit reached. Please try again later.')
    },
  }
)

function handleSubmit() {
  const remaining = rateLimiter.getRemainingInWindow()
  if (remaining > 0) {
    rateLimiter.maybeExecute('some data')
  }
}
</script>

<template>
  <button @click="handleSubmit">Submit</button>
</template>
```

### Debounced Ref Example

```vue
<script setup lang="ts">
import { useDebouncedRef } from '@tanstack/vue-pacer'

const { value: searchText, debouncedValue, debouncer } = useDebouncedRef('', {
  wait: 500,
})
</script>

<template>
  <div>
    <input v-model="searchText" placeholder="Search..." />
    <p>Instant: {{ searchText }}</p>
    <p>Debounced: {{ debouncedValue }}</p>
    
    <debouncer.Subscribe
      :selector="(state) => state"
      v-slot="state"
    >
      <pre>{{ JSON.stringify(state, null, 2) }}</pre>
    </debouncer.Subscribe>
  </div>
</template>
```
