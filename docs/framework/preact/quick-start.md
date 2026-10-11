---
title: Preact Quick Start
id: quick-start
redirectFrom:
  - framework/preact/adapter
---

TanStack Pacer controls when your functions run. The Preact adapter, `@tanstack/preact-pacer`, wraps each Pacer utility in a hook. The hook keeps one utility instance across renders, cancels pending work when the component unmounts, and re-renders only for the state you select.

This page starts with a debounced search input, then covers the patterns most apps need next.

## Installation

```sh
npm install @tanstack/preact-pacer
```

The adapter re-exports everything from `@tanstack/pacer`, so you do not need to install the core package. See [Installation](../../installation.md) for other package managers.

## Your first debouncer

The component below is complete. The input updates on every keystroke. `debouncedQuery` updates 500 ms after the user stops typing.

```tsx
import { useState } from 'preact/hooks'
import { useDebouncedValue } from '@tanstack/preact-pacer'

export function Search() {
  const [query, setQuery] = useState('')
  const [debouncedQuery] = useDebouncedValue(query, { wait: 500 })

  return (
    <div>
      <input
        value={query}
        onInput={(e) => setQuery(e.currentTarget.value)}
        placeholder="Search..."
      />
      <p>Searching for: {debouncedQuery}</p>
    </div>
  )
}
```

Pass `debouncedQuery` to your data fetching instead of `query`, and a fast typist sends one request instead of one per keystroke.

## Pick a hook

Every utility comes in several shapes. They share one engine and differ in what they hand back to you. For debouncing:

| Hook                   | Returns                        | Use it when                                               |
| ---------------------- | ------------------------------ | --------------------------------------------------------- |
| `useDebouncedCallback` | A debounced function           | You only need to call the function                        |
| `useDebouncedValue`    | `[debouncedValue, debouncer]`  | You already have a value in state and want a lagging copy |
| `useDebouncedState`    | `[value, setValue, debouncer]` | You want `useState` with a debounced setter               |
| `useDebouncer`         | The debouncer instance         | You need `flush`, `cancel`, or reactive state             |

The other utilities follow the same naming pattern:

| Utility       | Instance hook    | Async instance hook   | Guide                                      |
| ------------- | ---------------- | --------------------- | ------------------------------------------ |
| Debouncing    | `useDebouncer`   | `useAsyncDebouncer`   | [Debouncing](./guides/debouncing.md)       |
| Throttling    | `useThrottler`   | `useAsyncThrottler`   | [Throttling](./guides/throttling.md)       |
| Rate limiting | `useRateLimiter` | `useAsyncRateLimiter` | [Rate Limiting](./guides/rate-limiting.md) |
| Queuing       | `useQueuer`      | `useAsyncQueuer`      | [Queuing](./guides/queuing.md)             |
| Batching      | `useBatcher`     | `useAsyncBatcher`     | [Batching](./guides/batching.md)           |

Not sure which utility you need? Read [Which Pacer Utility Should I Choose?](../../guides/which-pacer-utility-should-i-choose.md).

## Common patterns

### Control the debouncer directly

`useDebouncer` returns the instance. Call `maybeExecute` from your event handler, and use `flush` or `cancel` when the user acts before the timer fires.

```tsx
import { useState } from 'preact/hooks'
import { useDebouncer } from '@tanstack/preact-pacer'

export function DraftEditor() {
  const [draft, setDraft] = useState('')

  const saver = useDebouncer(
    (text: string) => saveDraft(text),
    { wait: 1000 },
    (state) => ({ isPending: state.isPending }),
  )

  return (
    <div>
      <textarea
        value={draft}
        onInput={(e) => {
          setDraft(e.currentTarget.value)
          saver.maybeExecute(e.currentTarget.value)
        }}
      />
      <button onClick={() => saver.flush()}>Save now</button>
      <button onClick={() => saver.cancel()}>Discard</button>
      {saver.state.isPending && <p>Unsaved changes...</p>}
    </div>
  )
}
```

### Select the state you render

The third argument is a selector. Without it, `saver.state` is `{}` and state changes never re-render the component. Select only the fields you render.

When a child deep in the tree needs the state, use the `Subscribe` component instead. It subscribes that subtree only, so the owning component does not re-render:

```tsx
<saver.Subscribe selector={(state) => ({ isPending: state.isPending })}>
  {({ isPending }) => (isPending ? <span>Saving...</span> : null)}
</saver.Subscribe>
```

Each utility's guide lists the state fields it exposes.

### Change options between renders

The hook applies the options you pass on every render, so you can read props and state directly:

```tsx
const [debouncedQuery] = useDebouncedValue(query, {
  wait: isSlowNetwork ? 1000 : 300,
  enabled: query.length > 2,
})
```

A changed `wait` applies to the next call. It does not reschedule a timer that is already running. Setting `enabled` to `false` cancels pending work. `key`, `initialState`, and `initialItems` apply only when the hook first creates the utility.

### Run async work

The async hooks await your function, track execution state, and report errors. This search debounces the request and shows a loading state:

```tsx
import { useState } from 'preact/hooks'
import { useAsyncDebouncer } from '@tanstack/preact-pacer'

export function AsyncSearch() {
  const [results, setResults] = useState<Array<SearchResult>>([])

  const searcher = useAsyncDebouncer(
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
      {searcher.state.isExecuting && <p>Loading...</p>}
      <ul>
        {results.map((result) => (
          <li key={result.id}>{result.title}</li>
        ))}
      </ul>
    </div>
  )
}
```

`maybeExecute` returns a promise that resolves with your function's result. The async utilities also support retries and cancellation through an `AbortSignal`. See the [Async Debouncing Guide](./guides/async-debouncing.md).

### Limit how often an action runs

A rate limiter allows a fixed number of calls per window and rejects the rest:

```tsx
import { useRateLimiter } from '@tanstack/preact-pacer'

export function SendButton() {
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

  return (
    <div>
      <button onClick={() => limiter.maybeExecute('Hello')}>Send</button>
      <p>Rejected: {limiter.state.rejectionCount}</p>
    </div>
  )
}
```

### Process items in order

A queuer keeps every item and processes them in order. With `useAsyncQueuer`, `concurrency` sets how many run at once:

```tsx
import { useAsyncQueuer } from '@tanstack/preact-pacer'

export function Uploader() {
  const queue = useAsyncQueuer(
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
        Uploading {queue.state.activeItems.length}, waiting {queue.state.size}
      </p>
    </div>
  )
}
```

### Callback-only hooks

When you only need the scheduled function, the callback hooks skip the instance:

```tsx
import { useThrottledCallback } from '@tanstack/preact-pacer'

const onScroll = useThrottledCallback(() => savePosition(window.scrollY), {
  wait: 200,
})
```

Use the instance hook instead when you need `flush`, `cancel`, or state.

## Set default options

`PacerProvider` sets default options for every Pacer hook in its subtree. Options passed to a hook override the defaults.

```tsx
import { PacerProvider } from '@tanstack/preact-pacer'

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

To share options between specific hooks instead, define them once with an option helper. Helpers such as `debouncerOptions` return the object you pass in, typed for that utility:

```tsx
import { debouncerOptions, useDebouncer } from '@tanstack/preact-pacer'

const searchOptions = debouncerOptions({ wait: 500, leading: false })

const debouncer = useDebouncer(search, { ...searchOptions, key: 'search' })
```

## Control unmount cleanup

When the component unmounts, debouncers, throttlers, and batchers cancel pending work, and queuers stop processing. Async utilities also abort active work. To keep work instead, pass `onUnmount`. It replaces the default cleanup:

```tsx
const saver = useDebouncer(saveDraft, {
  wait: 1000,
  onUnmount: (debouncer) => debouncer.flush(),
})
```

## Set up devtools

Install the devtools packages:

```sh
npm install @tanstack/preact-devtools @tanstack/preact-pacer-devtools
```

Render the devtools once near the root of your app:

```tsx
import { TanStackDevtools } from '@tanstack/preact-devtools'
import { pacerDevtoolsPlugin } from '@tanstack/preact-pacer-devtools'

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
- The [Preact API Reference](./reference/index.md) lists every hook and its options.
- The [Preact examples](./examples/useDebouncer) are runnable apps for each hook.
