---
title: Vue Quick Start
id: quick-start
redirectFrom:
  - framework/vue/adapter
---

TanStack Pacer controls when your functions run. The Vue adapter, `@tanstack/vue-pacer`, wraps each Pacer utility in a composable. Call composables during component setup or inside an active effect scope. The utility cleans up when the scope is disposed and exposes the state you select as a ref.

This page starts with a debounced search input, then covers the patterns most apps need next.

## Installation

```sh
npm install @tanstack/vue-pacer
```

The adapter re-exports everything from `@tanstack/pacer`, so you do not need to install the core package. See [Installation](../../installation.md) for other package managers.

## Your first debouncer

The component below is complete. The input updates on every keystroke. `debouncedQuery` updates 500 ms after the user stops typing.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useDebouncedValue } from '@tanstack/vue-pacer'

const query = ref('')
const [debouncedQuery] = useDebouncedValue(query, { wait: 500 })
</script>

<template>
  <input v-model="query" placeholder="Search..." />
  <p>Searching for: {{ debouncedQuery }}</p>
</template>
```

`useDebouncedValue` accepts a ref or a getter such as `() => props.query`. It returns a read-only ref. Pass `debouncedQuery` to your data fetching instead of `query`, and a fast typist sends one request instead of one per keystroke.

## Pick a composable

Every utility comes in several shapes. They share one engine and differ in what they hand back to you. For debouncing:

| Composable          | Returns                        | Use it when                                                   |
| ------------------- | ------------------------------ | ------------------------------------------------------------- |
| `useDebouncedValue` | `[debouncedValue, debouncer]`  | You already have a ref and want a lagging copy                |
| `useDebouncedState` | `[value, setValue, debouncer]` | You want a ref with a debounced setter                        |
| `useDebouncer`      | The debouncer instance         | You need `maybeExecute`, `flush`, `cancel`, or reactive state |

The other utilities follow the same naming pattern:

| Utility       | Instance composable | Async instance composable | Guide                                      |
| ------------- | ------------------- | ------------------------- | ------------------------------------------ |
| Debouncing    | `useDebouncer`      | `useAsyncDebouncer`       | [Debouncing](./guides/debouncing.md)       |
| Throttling    | `useThrottler`      | `useAsyncThrottler`       | [Throttling](./guides/throttling.md)       |
| Rate limiting | `useRateLimiter`    | `useAsyncRateLimiter`     | [Rate Limiting](./guides/rate-limiting.md) |
| Queuing       | `useQueuer`         | `useAsyncQueuer`          | [Queuing](./guides/queuing.md)             |
| Batching      | `useBatcher`        | `useAsyncBatcher`         | [Batching](./guides/batching.md)           |

Not sure which utility you need? Read [Which Pacer Utility Should I Choose?](../../guides/which-pacer-utility-should-i-choose.md).

## Common patterns

### Control the debouncer directly

`useDebouncer` returns the instance. Call `maybeExecute` from your event handler, and use `flush` or `cancel` when the user acts before the timer fires.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useDebouncer } from '@tanstack/vue-pacer'

const draft = ref('')

const saver = useDebouncer(
  (text: string) => saveDraft(text),
  { wait: 1000 },
  (state) => ({ isPending: state.isPending }),
)
const saverState = saver.state

function onInput(event: Event) {
  draft.value = (event.target as HTMLTextAreaElement).value
  saver.maybeExecute(draft.value)
}
</script>

<template>
  <textarea :value="draft" @input="onInput" />
  <button @click="saver.flush()">Save now</button>
  <button @click="saver.cancel()">Discard</button>
  <p v-if="saverState.isPending">Unsaved changes...</p>
</template>
```

### Select the state you render

The third argument is a selector. `saver.state` is a ref, so read `saver.state.value` in script. Without a selector, it holds `{}` and never changes. Select only the fields you render.

Vue templates unwrap top-level refs only. `saver.state.isPending` in a template reads a property of the ref object, not of its value. Assign the ref to a top-level variable, as `saverState` does above.

To read state in one part of the template without a selector on the utility, use the `Subscribe` component. Its slot receives the selected state, and the owning component does not re-render:

```vue
<saver.Subscribe
  :selector="(state) => ({ isPending: state.isPending })"
  v-slot="{ isPending }"
>
  <span v-if="isPending">Saving...</span>
</saver.Subscribe>
```

Each utility's guide lists the state fields it exposes.

### Make options reactive

A plain options object is read once. To make an option follow a ref or a prop, pass a factory that returns the options:

```ts
const props = defineProps<{ wait: number }>()

const debouncer = useDebouncer(search, () => ({ wait: props.wait }))
```

Property getters such as `get wait() { return props.wait }` work too. A ref placed inside a plain options object is not unwrapped.

When an option changes, the adapter updates the same utility. Pending work and state survive. A changed `wait` applies to the next call. It does not reschedule a timer that is already running. Setting `enabled` to `false` cancels pending work. `key`, `initialState`, and `initialItems` apply only when the utility is created.

### Run async work

The async composables await your function, track execution state, and report errors. This search debounces the request and shows a loading state:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useAsyncDebouncer } from '@tanstack/vue-pacer'

const results = ref<Array<SearchResult>>([])

const searcher = useAsyncDebouncer(
  async (term: string) => {
    const data = await fetchSearchResults(term)
    results.value = data
    return data
  },
  {
    wait: 300,
    onError: (error) => console.error('Search failed:', error),
  },
  (state) => ({ isExecuting: state.isExecuting }),
)
const searcherState = searcher.state
</script>

<template>
  <input
    @input="searcher.maybeExecute(($event.target as HTMLInputElement).value)"
  />
  <p v-if="searcherState.isExecuting">Loading...</p>
  <ul>
    <li v-for="result in results" :key="result.id">{{ result.title }}</li>
  </ul>
</template>
```

`maybeExecute` returns a promise that resolves with your function's result. The async utilities also support retries and cancellation through an `AbortSignal`. See the [Async Debouncing Guide](./guides/async-debouncing.md).

### Limit how often an action runs

A rate limiter allows a fixed number of calls per window and rejects the rest:

```vue
<script setup lang="ts">
import { useRateLimiter } from '@tanstack/vue-pacer'

const limiter = useRateLimiter(
  (message: string) => sendMessage(message),
  {
    limit: 5,
    window: 60_000,
    onReject: (limiter) =>
      alert(`Slow down. Try again in ${limiter.getMsUntilNextWindow()} ms.`),
  },
  (state) => ({ rejectionCount: state.rejectionCount }),
)
const limiterState = limiter.state
</script>

<template>
  <button @click="limiter.maybeExecute('Hello')">Send</button>
  <p>Rejected: {{ limiterState.rejectionCount }}</p>
</template>
```

### Process items in order

A queuer keeps every item and processes them in order. With `useAsyncQueuer`, `concurrency` sets how many run at once:

```vue
<script setup lang="ts">
import { useAsyncQueuer } from '@tanstack/vue-pacer'

const queue = useAsyncQueuer(
  async (file: File) => uploadFile(file),
  { concurrency: 3 },
  (state) => ({ size: state.size, activeItems: state.activeItems }),
)
const queueState = queue.state

function onFiles(event: Event) {
  const files = (event.target as HTMLInputElement).files
  for (const file of files ?? []) queue.addItem(file)
}
</script>

<template>
  <input type="file" multiple @change="onFiles" />
  <p>
    Uploading {{ queueState.activeItems.length }}, waiting
    {{ queueState.size }}
  </p>
</template>
```

## Set default options

`PacerProvider` sets default options for every Pacer composable in its subtree. Options passed to a composable override the defaults.

```vue
<script setup lang="ts">
import { PacerProvider } from '@tanstack/vue-pacer'
</script>

<template>
  <PacerProvider
    :default-options="{
      debouncer: { wait: 500 },
      asyncQueuer: { concurrency: 3 },
      rateLimiter: { limit: 5, window: 60_000 },
    }"
  >
    <AppContent />
  </PacerProvider>
</template>
```

To set defaults from a component's setup without a wrapper, call `providePacerOptions` with the same object or a factory that returns it.

To share options between specific composables instead, define them once with an option helper. Helpers such as `debouncerOptions` return the object you pass in, typed for that utility:

```ts
import { debouncerOptions, useDebouncer } from '@tanstack/vue-pacer'

const searchOptions = debouncerOptions({ wait: 500, leading: false })

const debouncer = useDebouncer(search, { ...searchOptions, key: 'search' })
```

## Control cleanup

When the scope is disposed, debouncers, throttlers, and batchers cancel pending work, and queuers stop processing. Async utilities also abort active work. To keep work instead, pass `onUnmount`. It replaces the default cleanup:

```ts
const saver = useDebouncer(saveDraft, {
  wait: 1000,
  onUnmount: (debouncer) => debouncer.flush(),
})
```

## Set up devtools

Install the devtools packages:

```sh
npm install @tanstack/vue-devtools @tanstack/vue-pacer-devtools
```

Render the devtools once in your root component:

```vue
<script setup lang="ts">
import { TanStackDevtools } from '@tanstack/vue-devtools'
import { pacerDevtoolsPlugin } from '@tanstack/vue-pacer-devtools'

const dev = import.meta.env.DEV
const plugins = [pacerDevtoolsPlugin()]
</script>

<template>
  <AppContent />
  <TanStackDevtools v-if="dev" :plugins="plugins" />
</template>
```

A utility appears in the Pacer panel only when you give it a `key` option. See [Devtools](../../devtools.md) for production builds.

## Next steps

- [Which Pacer Utility Should I Choose?](../../guides/which-pacer-utility-should-i-choose.md) compares all five utilities.
- The [Debouncing](./guides/debouncing.md), [Throttling](./guides/throttling.md), [Rate Limiting](./guides/rate-limiting.md), [Queuing](./guides/queuing.md), and [Batching](./guides/batching.md) guides cover each utility's options and state. Each has an async counterpart.
- The [Vue API Reference](./reference/index.md) lists every composable and its options.
- The [Vue examples](./examples/useDebouncer) are runnable apps for each composable.
