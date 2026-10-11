---
title: Vanilla Quick Start
id: quick-start
redirectFrom:
  - quick-start
---

TanStack Pacer controls when your functions run. Without a framework, use the core `@tanstack/pacer` package directly. It provides each utility both as a function that wraps your callback and as a class with methods and observable state.

This page starts with a debounced search input, then covers the patterns most apps need next. If you use a framework, start with its quick start instead. The adapters add lifecycle cleanup and reactive state on top of everything shown here.

## Installation

```sh
npm install @tanstack/pacer
```

See [Installation](../../installation.md) for other package managers.

## Your first debouncer

`debounce` wraps a function. The wrapped function waits until calls stop for `wait` milliseconds, then runs once with the latest arguments.

```ts
import { debounce } from '@tanstack/pacer'

const input = document.querySelector<HTMLInputElement>('#search')!

const search = debounce(
  (query: string) => {
    console.log('Searching for', query)
  },
  { wait: 500 },
)

input.addEventListener('input', () => search(input.value))
```

Type "pacer" quickly and the console logs `Searching for pacer` once, 500 ms after the last keystroke.

## Pick a function or a class

Every utility comes as a function and as a class:

| Utility       | Function    | Class         | Async class        | Guide                                      |
| ------------- | ----------- | ------------- | ------------------ | ------------------------------------------ |
| Debouncing    | `debounce`  | `Debouncer`   | `AsyncDebouncer`   | [Debouncing](./guides/debouncing.md)       |
| Throttling    | `throttle`  | `Throttler`   | `AsyncThrottler`   | [Throttling](./guides/throttling.md)       |
| Rate limiting | `rateLimit` | `RateLimiter` | `AsyncRateLimiter` | [Rate Limiting](./guides/rate-limiting.md) |
| Queuing       | `queue`     | `Queuer`      | `AsyncQueuer`      | [Queuing](./guides/queuing.md)             |
| Batching      | `batch`     | `Batcher`     | `AsyncBatcher`     | [Batching](./guides/batching.md)           |

Each async class also has a matching function, such as `asyncDebounce`. Use the function when you only need to call the wrapped callback. Use the class when you need to flush, cancel, change options, or read state.

Not sure which utility you need? Read [Which Pacer Utility Should I Choose?](../../guides/which-pacer-utility-should-i-choose.md).

## Common patterns

### Control the debouncer directly

`Debouncer` exposes the same scheduling as `debounce`, plus methods to act on pending work:

```ts
import { Debouncer } from '@tanstack/pacer'

const saver = new Debouncer((text: string) => saveDraft(text), { wait: 1000 })

editor.addEventListener('input', () => saver.maybeExecute(editor.value))
saveButton.addEventListener('click', () => saver.flush())
discardButton.addEventListener('click', () => saver.cancel())
```

`flush` runs pending work now. `cancel` drops it.

### Read and subscribe to state

Every class keeps its state in a [TanStack Store](https://tanstack.com/store). Read the current state from `store.state`, and subscribe to changes with `store.subscribe`:

```ts
const subscription = saver.store.subscribe(() => {
  status.textContent = saver.store.state.isPending ? 'Unsaved changes...' : ''
})

// Later, when the element goes away
subscription.unsubscribe()
saver.cancel()
```

Without a framework adapter, cleanup is your job. Unsubscribe and cancel pending work when the owning UI goes away. Each utility's guide lists the state fields it exposes.

### Change options at runtime

Call `setOptions` with the options to change. It merges them into the current options:

```ts
saver.setOptions({ wait: 2000 })
```

A changed `wait` applies to the next call. It does not reschedule a timer that is already running. Setting `enabled` to `false` cancels pending work.

### Run async work

The async classes await your function, track execution state, and report errors:

```ts
import { AsyncDebouncer } from '@tanstack/pacer'

const searcher = new AsyncDebouncer(
  async (term: string): Promise<Array<SearchResult>> => {
    const response = await fetch(`/api/search?q=${encodeURIComponent(term)}`, {
      signal: searcher.getAbortSignal() ?? undefined,
    })
    return response.json()
  },
  {
    wait: 300,
    onSuccess: (results) => renderResults(results),
    onError: (error) => console.error('Search failed:', error),
  },
)

input.addEventListener('input', () => searcher.maybeExecute(input.value))
```

`maybeExecute` returns a promise that resolves with your function's result. `getAbortSignal()` returns the signal for the current run, so `searcher.abort()` can stop the request. The async utilities also support retries. See the [Async Debouncing Guide](./guides/async-debouncing.md).

### Limit how often an action runs

A rate limiter allows a fixed number of calls per window and rejects the rest:

```ts
import { rateLimit } from '@tanstack/pacer'

const send = rateLimit((message: string) => sendMessage(message), {
  limit: 5,
  window: 60_000,
  onReject: (limiter) =>
    console.warn(`Try again in ${limiter.getMsUntilNextWindow()} ms`),
})

sendButton.addEventListener('click', () => send('Hello'))
```

### Process items in order

A queuer keeps every item and processes them in order. With `AsyncQueuer`, `concurrency` sets how many run at once:

```ts
import { AsyncQueuer } from '@tanstack/pacer'

const uploads = new AsyncQueuer(async (file: File) => uploadFile(file), {
  concurrency: 3,
})

fileInput.addEventListener('change', () => {
  for (const file of fileInput.files ?? []) uploads.addItem(file)
})
```

## Share options

Option helpers such as `debouncerOptions` return the object you pass in, typed for that utility. Use them to define options once and reuse them:

```ts
import { Debouncer, debouncerOptions } from '@tanstack/pacer'

const searchOptions = debouncerOptions({ wait: 500, leading: false })

const debouncer = new Debouncer(search, { ...searchOptions, key: 'search' })
```

## Import only what you use

The package root tree-shakes. Each utility also has its own entry point, such as `@tanstack/pacer/debouncer`, for bundlers or libraries that need a guaranteed small import.

If you publish a library and need the smallest possible footprint, see Pacer Lite in the [Overview](../../overview.md#pacer-lite). It drops reactive state and devtools support in exchange for a smaller bundle.

## Set up devtools

Install the devtools packages:

```sh
npm install @tanstack/devtools @tanstack/pacer-devtools
```

Mount `TanStackDevtoolsCore` with `plugins: [pacerDevtoolsPlugin()]` once in your application. The [devtools setup](../../devtools.md#lit-alpine-ember-and-octane-setup) shows a mount function you can reuse. A utility appears in the Pacer panel only when you give it a `key` option.

## Next steps

- [Which Pacer Utility Should I Choose?](../../guides/which-pacer-utility-should-i-choose.md) compares all five utilities.
- The [Debouncing](./guides/debouncing.md), [Throttling](./guides/throttling.md), [Rate Limiting](./guides/rate-limiting.md), [Queuing](./guides/queuing.md), and [Batching](./guides/batching.md) guides cover each utility's options and state. Each has an async counterpart.
- The [API Reference](../../reference/index.md) lists every class, function, and option.
