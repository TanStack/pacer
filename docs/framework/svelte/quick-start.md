---
title: Svelte Quick Start
id: quick-start
redirectFrom:
  - framework/svelte/adapter
---

TanStack Pacer controls when your functions run. The Svelte adapter, `@tanstack/svelte-pacer`, wraps each Pacer utility in a `create*` function for Svelte 5. Call it during component initialization. The utility cleans up when the component is destroyed and exposes the state you select as reactive state.

This page starts with a debounced search input, then covers the patterns most apps need next.

## Installation

```sh
npm install @tanstack/svelte-pacer
```

The adapter re-exports everything from `@tanstack/pacer`, so you do not need to install the core package. See [Installation](../../installation.md) for other package managers.

## Your first debouncer

The component below is complete. The input updates on every keystroke. `debouncedQuery()` updates 500 ms after the user stops typing.

```svelte
<script lang="ts">
  import { createDebouncedValue } from '@tanstack/svelte-pacer'

  let query = $state('')
  const [debouncedQuery] = createDebouncedValue(() => query, { wait: 500 })
</script>

<input bind:value={query} placeholder="Search..." />
<p>Searching for: {debouncedQuery()}</p>
```

`createDebouncedValue` takes a getter, `() => query`, so it can track changes. It returns a getter too, so call `debouncedQuery()` to read it. Pass the debounced value to your data fetching instead of `query`, and a fast typist sends one request instead of one per keystroke.

## Pick a function

Every utility comes in several shapes. They share one engine and differ in what they hand back to you. For debouncing:

| Function                | Returns                        | Use it when                                                   |
| ----------------------- | ------------------------------ | ------------------------------------------------------------- |
| `createDebouncedValue`  | `[debouncedValue, debouncer]`  | You already have state and want a lagging copy                |
| `createDebouncedSignal` | `[value, setValue, debouncer]` | You want state with a debounced setter                        |
| `createDebouncer`       | The debouncer instance         | You need `maybeExecute`, `flush`, `cancel`, or reactive state |

The other utilities follow the same naming pattern:

| Utility       | Instance function   | Async instance function  | Guide                                      |
| ------------- | ------------------- | ------------------------ | ------------------------------------------ |
| Debouncing    | `createDebouncer`   | `createAsyncDebouncer`   | [Debouncing](./guides/debouncing.md)       |
| Throttling    | `createThrottler`   | `createAsyncThrottler`   | [Throttling](./guides/throttling.md)       |
| Rate limiting | `createRateLimiter` | `createAsyncRateLimiter` | [Rate Limiting](./guides/rate-limiting.md) |
| Queuing       | `createQueuer`      | `createAsyncQueuer`      | [Queuing](./guides/queuing.md)             |
| Batching      | `createBatcher`     | `createAsyncBatcher`     | [Batching](./guides/batching.md)           |

Not sure which utility you need? Read [Which Pacer Utility Should I Choose?](../../guides/which-pacer-utility-should-i-choose.md).

## Common patterns

### Control the debouncer directly

`createDebouncer` returns the instance. Call `maybeExecute` from your event handler, and use `flush` or `cancel` when the user acts before the timer fires.

```svelte
<script lang="ts">
  import { createDebouncer } from '@tanstack/svelte-pacer'

  let draft = $state('')

  const saver = createDebouncer(
    (text: string) => saveDraft(text),
    { wait: 1000 },
    (state) => ({ isPending: state.isPending }),
  )

  function onInput(event: Event) {
    draft = (event.target as HTMLTextAreaElement).value
    saver.maybeExecute(draft)
  }
</script>

<textarea value={draft} oninput={onInput}></textarea>
<button onclick={() => saver.flush()}>Save now</button>
<button onclick={() => saver.cancel()}>Discard</button>
{#if saver.state.isPending}
  <p>Unsaved changes...</p>
{/if}
```

### Select the state you render

The third argument is a selector. Read the selected fields from `saver.state`. Without a selector, it is `{}` and never changes. Select only the fields you render.

Read `saver.state.isPending` where you need it. Destructuring `saver.state` in the script reads the values once and loses reactivity.

To read state in one part of the markup without a selector on the utility, use the `Subscribe` component with a `children` snippet:

```svelte
<saver.Subscribe selector={(state) => ({ isPending: state.isPending })}>
  {#snippet children({ isPending })}
    {#if isPending}<span>Saving...</span>{/if}
  {/snippet}
</saver.Subscribe>
```

Each utility's guide lists the state fields it exposes.

### Make options reactive

A plain options object is read once. To make an option follow state or a prop, pass a factory that returns the options:

```svelte
<script lang="ts">
  import { createDebouncer } from '@tanstack/svelte-pacer'

  let { wait }: { wait: number } = $props()

  const debouncer = createDebouncer(search, () => ({ wait }))
</script>
```

Property getters such as `get wait() { return wait }` work too.

When an option changes, the adapter updates the same utility before the next render. Pending work and state survive. A changed `wait` applies to the next call. It does not reschedule a timer that is already running. Setting `enabled` to `false` cancels pending work. `key`, `initialState`, and `initialItems` apply only when the utility is created.

### Run async work

The async functions await your function, track execution state, and report errors. This search debounces the request and shows a loading state:

```svelte
<script lang="ts">
  import { createAsyncDebouncer } from '@tanstack/svelte-pacer'

  let results = $state<Array<SearchResult>>([])

  const searcher = createAsyncDebouncer(
    async (term: string) => {
      const data = await fetchSearchResults(term)
      results = data
      return data
    },
    {
      wait: 300,
      onError: (error) => console.error('Search failed:', error),
    },
    (state) => ({ isExecuting: state.isExecuting }),
  )
</script>

<input
  oninput={(e) => searcher.maybeExecute((e.target as HTMLInputElement).value)}
/>
{#if searcher.state.isExecuting}
  <p>Loading...</p>
{/if}
<ul>
  {#each results as result (result.id)}
    <li>{result.title}</li>
  {/each}
</ul>
```

`maybeExecute` returns a promise that resolves with your function's result. The async utilities also support retries and cancellation through an `AbortSignal`. See the [Async Debouncing Guide](./guides/async-debouncing.md).

### Limit how often an action runs

A rate limiter allows a fixed number of calls per window and rejects the rest:

```svelte
<script lang="ts">
  import { createRateLimiter } from '@tanstack/svelte-pacer'

  const limiter = createRateLimiter(
    (message: string) => sendMessage(message),
    {
      limit: 5,
      window: 60_000,
      onReject: (limiter) =>
        alert(`Slow down. Try again in ${limiter.getMsUntilNextWindow()} ms.`),
    },
    (state) => ({ rejectionCount: state.rejectionCount }),
  )
</script>

<button onclick={() => limiter.maybeExecute('Hello')}>Send</button>
<p>Rejected: {limiter.state.rejectionCount}</p>
```

### Process items in order

A queuer keeps every item and processes them in order. With `createAsyncQueuer`, `concurrency` sets how many run at once:

```svelte
<script lang="ts">
  import { createAsyncQueuer } from '@tanstack/svelte-pacer'

  const queue = createAsyncQueuer(
    async (file: File) => uploadFile(file),
    { concurrency: 3 },
    (state) => ({ size: state.size, activeItems: state.activeItems }),
  )

  function onFiles(event: Event) {
    const files = (event.target as HTMLInputElement).files
    for (const file of files ?? []) queue.addItem(file)
  }
</script>

<input type="file" multiple onchange={onFiles} />
<p>
  Uploading {queue.state.activeItems.length}, waiting {queue.state.size}
</p>
```

## Set default options

`PacerProvider` sets default options for every Pacer utility created in its subtree. Options passed to a utility override the defaults.

```svelte
<script lang="ts">
  import { PacerProvider } from '@tanstack/svelte-pacer'
</script>

<PacerProvider
  defaultOptions={{
    debouncer: { wait: 500 },
    asyncQueuer: { concurrency: 3 },
    rateLimiter: { limit: 5, window: 60_000 },
  }}
>
  <AppContent />
</PacerProvider>
```

To set defaults without a wrapper component, call `providePacerOptions(() => defaults)` during component initialization.

To share options between specific utilities instead, define them once with an option helper. Helpers such as `debouncerOptions` return the object you pass in, typed for that utility:

```ts
import { createDebouncer, debouncerOptions } from '@tanstack/svelte-pacer'

const searchOptions = debouncerOptions({ wait: 500, leading: false })

const debouncer = createDebouncer(search, { ...searchOptions, key: 'search' })
```

## Control cleanup

When the component is destroyed, debouncers, throttlers, and batchers cancel pending work, and queuers stop processing. Async utilities also abort active work. To keep work instead, pass `onUnmount`. It replaces the default cleanup:

```ts
const saver = createDebouncer(saveDraft, {
  wait: 1000,
  onUnmount: (debouncer) => debouncer.flush(),
})
```

## Set up devtools

Install the devtools packages:

```sh
npm install @tanstack/svelte-devtools @tanstack/svelte-pacer-devtools
```

Render the devtools once in your root component:

```svelte
<script lang="ts">
  import { TanStackDevtools } from '@tanstack/svelte-devtools'
  import { pacerDevtoolsPlugin } from '@tanstack/svelte-pacer-devtools'
</script>

{#if import.meta.env.DEV}
  <TanStackDevtools plugins={[pacerDevtoolsPlugin()]} />
{/if}
```

A utility appears in the Pacer panel only when you give it a `key` option. See [Devtools](../../devtools.md) for SvelteKit and production builds.

## Next steps

- [Which Pacer Utility Should I Choose?](../../guides/which-pacer-utility-should-i-choose.md) compares all five utilities.
- The [Debouncing](./guides/debouncing.md), [Throttling](./guides/throttling.md), [Rate Limiting](./guides/rate-limiting.md), [Queuing](./guides/queuing.md), and [Batching](./guides/batching.md) guides cover each utility's options and state. Each has an async counterpart.
- The [Svelte API Reference](./reference/index.md) lists every function and its options.
- The [Svelte examples](./examples/createDebouncer) are runnable apps for each function.
