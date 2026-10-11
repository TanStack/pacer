---
title: Solid Quick Start
id: quick-start
redirectFrom:
  - framework/solid/adapter
---

TanStack Pacer controls when your functions run. The Solid adapter, `@tanstack/solid-pacer`, wraps each Pacer utility in a `create*` function. The utility belongs to the current reactive owner, cancels pending work when that owner is disposed, and exposes the state you select as an accessor.

This page starts with a debounced search input, then covers the patterns most apps need next.

## Installation

```sh
npm install @tanstack/solid-pacer
```

The adapter re-exports everything from `@tanstack/pacer`, so you do not need to install the core package. See [Installation](../../installation.md) for other package managers.

## Your first debouncer

The component below is complete. The input updates on every keystroke. `debouncedQuery()` updates 500 ms after the user stops typing.

```tsx
import { createSignal } from 'solid-js'
import { createDebouncedValue } from '@tanstack/solid-pacer'

export function Search() {
  const [query, setQuery] = createSignal('')
  const [debouncedQuery] = createDebouncedValue(query, { wait: 500 })

  return (
    <div>
      <input
        value={query()}
        onInput={(e) => setQuery(e.currentTarget.value)}
        placeholder="Search..."
      />
      <p>Searching for: {debouncedQuery()}</p>
    </div>
  )
}
```

`createDebouncedValue` takes the `query` accessor itself, not `query()`, so it can track changes. Pass `debouncedQuery` to your data fetching instead of `query`, and a fast typist sends one request instead of one per keystroke.

## Pick a function

Every utility comes in several shapes. They share one engine and differ in what they hand back to you. For debouncing:

| Function                | Returns                        | Use it when                                                   |
| ----------------------- | ------------------------------ | ------------------------------------------------------------- |
| `createDebouncedValue`  | `[debouncedValue, debouncer]`  | You already have a signal and want a lagging copy             |
| `createDebouncedSignal` | `[value, setValue, debouncer]` | You want `createSignal` with a debounced setter               |
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

```tsx
import { createSignal } from 'solid-js'
import { createDebouncer } from '@tanstack/solid-pacer'

export function DraftEditor() {
  const [draft, setDraft] = createSignal('')

  const saver = createDebouncer(
    (text: string) => saveDraft(text),
    { wait: 1000 },
    (state) => ({ isPending: state.isPending }),
  )

  return (
    <div>
      <textarea
        value={draft()}
        onInput={(e) => {
          setDraft(e.currentTarget.value)
          saver.maybeExecute(e.currentTarget.value)
        }}
      />
      <button onClick={() => saver.flush()}>Save now</button>
      <button onClick={() => saver.cancel()}>Discard</button>
      {saver.state().isPending && <p>Unsaved changes...</p>}
    </div>
  )
}
```

### Select the state you render

The third argument is a selector. `saver.state` is an accessor, so call `saver.state()` to read it. Without a selector, it returns `{}` and never updates. Select only the fields you render.

To read state in one part of the JSX without a selector on the utility, use the `Subscribe` component. Its child function receives an accessor:

```tsx
<saver.Subscribe selector={(state) => ({ isPending: state.isPending })}>
  {(state) => (state().isPending ? <span>Saving...</span> : null)}
</saver.Subscribe>
```

Each utility's guide lists the state fields it exposes.

### Make options reactive

A plain options object is read once. To make an option follow a signal, use a getter or pass an accessor that returns the options:

```tsx
const [wait, setWait] = createSignal(300)

const debouncer = createDebouncer(search, {
  get wait() {
    return wait()
  },
})

// Or pass an accessor
const debouncer2 = createDebouncer(search, () => ({ wait: wait() }))
```

Writing `{ wait: wait() }` without the getter or accessor reads the signal once and never updates.

When an option changes, the adapter updates the same utility. Pending work and state survive. A changed `wait` applies to the next call. It does not reschedule a timer that is already running. Setting `enabled` to `false` cancels pending work. `key`, `initialState`, and `initialItems` apply only when the utility is created.

### Run async work

The async functions await your function, track execution state, and report errors. This search debounces the request and shows a loading state:

```tsx
import { For, createSignal } from 'solid-js'
import { createAsyncDebouncer } from '@tanstack/solid-pacer'

export function AsyncSearch() {
  const [results, setResults] = createSignal<Array<SearchResult>>([])

  const searcher = createAsyncDebouncer(
    async (term: string) => {
      const data = await fetchSearchResults(term)
      setResults(data)
      return data
    },
    {
      wait: 300,
      onError: (error) => console.error('Search failed:', error),
    },
    (state) => ({ isExecuting: state.isExecuting }),
  )

  return (
    <div>
      <input onInput={(e) => searcher.maybeExecute(e.currentTarget.value)} />
      {searcher.state().isExecuting && <p>Loading...</p>}
      <ul>
        <For each={results()}>{(result) => <li>{result.title}</li>}</For>
      </ul>
    </div>
  )
}
```

`maybeExecute` returns a promise that resolves with your function's result. The async utilities also support retries and cancellation through an `AbortSignal`. See the [Async Debouncing Guide](./guides/async-debouncing.md).

### Limit how often an action runs

A rate limiter allows a fixed number of calls per window and rejects the rest:

```tsx
import { createRateLimiter } from '@tanstack/solid-pacer'

export function SendButton() {
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

  return (
    <div>
      <button onClick={() => limiter.maybeExecute('Hello')}>Send</button>
      <p>Rejected: {limiter.state().rejectionCount}</p>
    </div>
  )
}
```

### Process items in order

A queuer keeps every item and processes them in order. With `createAsyncQueuer`, `concurrency` sets how many run at once:

```tsx
import { createAsyncQueuer } from '@tanstack/solid-pacer'

export function Uploader() {
  const queue = createAsyncQueuer(
    async (file: File) => uploadFile(file),
    { concurrency: 3 },
    (state) => ({ size: state.size, activeItems: state.activeItems }),
  )

  return (
    <div>
      <input
        type="file"
        multiple
        onChange={(e) => {
          for (const file of e.currentTarget.files ?? []) queue.addItem(file)
        }}
      />
      <p>
        Uploading {queue.state().activeItems.length}, waiting{' '}
        {queue.state().size}
      </p>
    </div>
  )
}
```

## Set default options

`PacerProvider` sets default options for every Pacer utility created in its subtree. Options passed to a utility override the defaults.

```tsx
import { PacerProvider } from '@tanstack/solid-pacer'

export function Root() {
  return (
    <PacerProvider
      defaultOptions={{
        debouncer: { wait: 500 },
        asyncQueuer: { concurrency: 3 },
        rateLimiter: { limit: 5, window: 60_000 },
      }}
    >
      <App />
    </PacerProvider>
  )
}
```

To share options between specific utilities instead, define them once with an option helper. Helpers such as `debouncerOptions` return the object you pass in, typed for that utility:

```tsx
import { createDebouncer, debouncerOptions } from '@tanstack/solid-pacer'

const searchOptions = debouncerOptions({ wait: 500, leading: false })

const debouncer = createDebouncer(search, { ...searchOptions, key: 'search' })
```

## Control cleanup

When the owner is disposed, debouncers, throttlers, and batchers cancel pending work, and queuers stop processing. Async utilities also abort active work. To keep work instead, pass `onUnmount`. It replaces the default cleanup:

```tsx
const saver = createDebouncer(saveDraft, {
  wait: 1000,
  onUnmount: (debouncer) => debouncer.flush(),
})
```

## Set up devtools

Install the devtools packages:

```sh
npm install @tanstack/solid-devtools @tanstack/solid-pacer-devtools
```

Render the devtools once near the root of your app:

```tsx
import { TanStackDevtools } from '@tanstack/solid-devtools'
import { pacerDevtoolsPlugin } from '@tanstack/solid-pacer-devtools'

export function App() {
  return (
    <>
      {/* Your app */}
      <TanStackDevtools plugins={[pacerDevtoolsPlugin()]} />
    </>
  )
}
```

A utility appears in the Pacer panel only when you give it a `key` option. See [Devtools](../../devtools.md) for production builds.

## Next steps

- [Which Pacer Utility Should I Choose?](../../guides/which-pacer-utility-should-i-choose.md) compares all five utilities.
- The [Debouncing](./guides/debouncing.md), [Throttling](./guides/throttling.md), [Rate Limiting](./guides/rate-limiting.md), [Queuing](./guides/queuing.md), and [Batching](./guides/batching.md) guides cover each utility's options and state. Each has an async counterpart.
- The [Solid API Reference](./reference/index.md) lists every function and its options.
- The [Solid examples](./examples/createDebouncer) are runnable apps for each function.
