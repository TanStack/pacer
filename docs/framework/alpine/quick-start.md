---
title: Alpine Quick Start
id: quick-start
redirectFrom:
  - framework/alpine/adapter
---

TanStack Pacer controls when your functions run. The Alpine adapter, `@tanstack/alpine-pacer`, creates Pacer utilities that belong to a scope. The scope tracks option changes, updates your templates when selected state changes, and cleans up every utility it owns when you destroy it.

This page starts with a debounced search input, then covers the patterns most apps need next.

## Installation

```sh
npm install @tanstack/alpine-pacer
```

The adapter re-exports everything from `@tanstack/pacer`, so you do not need to install the core package. See [Installation](../../installation.md) for other package managers.

## Your first debouncer

The component below is complete. The input updates on every keystroke. The debounced query updates 500 ms after the user stops typing.

```ts
import Alpine from 'alpinejs'
import { createPacerScope } from '@tanstack/alpine-pacer'

Alpine.data('search', () => {
  const scope = createPacerScope()

  return {
    query: '',
    debouncedQuery: () => '',
    init() {
      ;[this.debouncedQuery] = scope.createDebouncedValue(() => this.query, {
        wait: 500,
      })
    },
    destroy() {
      scope.destroy()
    },
  }
})

Alpine.start()
```

```html
<div x-data="search">
  <input x-model="query" placeholder="Search..." />
  <p>Searching for: <span x-text="debouncedQuery()"></span></p>
</div>
```

Create utilities in `init()`, where `this` is Alpine's reactive proxy. `createDebouncedValue` takes a getter, `() => this.query`, so it can track changes. It returns a getter too, so call `debouncedQuery()` to read it. Destroying the scope in `destroy()` cancels any pending update.

Pass the debounced value to your data fetching instead of `query`, and a fast typist sends one request instead of one per keystroke.

### Skip the scope with the `$pacer` magic

If you install `pacerPlugin`, every component gets a `$pacer` scope that Alpine destroys with the element. You no longer need `createPacerScope` or `destroy()`. The adapter does not add `$pacer` to Alpine's TypeScript types, so this example is JavaScript:

```js
import Alpine from 'alpinejs'
import { pacerPlugin } from '@tanstack/alpine-pacer'

Alpine.plugin(pacerPlugin)

Alpine.data('search', () => ({
  query: '',
  debouncedQuery: () => '',
  init() {
    ;[this.debouncedQuery] = this.$pacer.createDebouncedValue(
      () => this.query,
      { wait: 500 },
    )
  },
}))
```

The rest of this page uses an explicit scope. Every scope method is also available on `$pacer`.

## Pick a method

Every utility comes in several shapes. They share one engine and differ in what they hand back to you. For debouncing:

| Scope method           | Returns                        | Use it when                                                   |
| ---------------------- | ------------------------------ | ------------------------------------------------------------- |
| `createDebouncedValue` | `[debouncedValue, debouncer]`  | You already have a property and want a lagging copy           |
| `createDebouncedState` | `[value, setValue, debouncer]` | You want a value with a debounced setter                      |
| `createDebouncer`      | The debouncer instance         | You need `maybeExecute`, `flush`, `cancel`, or reactive state |

The other utilities follow the same naming pattern:

| Utility       | Instance method     | Async instance method    | Guide                                      |
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

```ts
import Alpine from 'alpinejs'
import { createPacerScope } from '@tanstack/alpine-pacer'
import type { AlpineDebouncer } from '@tanstack/alpine-pacer'

Alpine.data('draftEditor', () => {
  const scope = createPacerScope()

  return {
    draft: '',
    saver: null as AlpineDebouncer<
      (text: string) => void,
      { isPending: boolean }
    > | null,
    init() {
      this.saver = scope.createDebouncer(
        (text: string) => saveDraft(text),
        { wait: 1000 },
        (state) => ({ isPending: state.isPending }),
      )
    },
    onInput() {
      this.saver!.maybeExecute(this.draft)
    },
    destroy() {
      scope.destroy()
    },
  }
})
```

```html
<div x-data="draftEditor">
  <textarea x-model="draft" @input="onInput"></textarea>
  <button @click="saver.flush()">Save now</button>
  <button @click="saver.cancel()">Discard</button>
  <p x-show="saver.state.isPending">Unsaved changes...</p>
</div>
```

### Select the state you render

The last argument is a selector. Read the selected fields from `saver.state` in your template. Without a selector, it is `{}` and never changes. Select only the fields your template reads.

A child component can subscribe to the same utility with its own selector. Call `subscribe` with the child's scope. It returns a reactive getter for the selection and leaves the owner's selection unchanged:

```ts
const status = saver.subscribe(childScope, (state) => ({
  isPending: state.isPending,
}))

// In the child's template or a getter
status().isPending
```

Destroy the child scope in the child component's `destroy()` hook to release the subscription. Each utility's guide lists the state fields it exposes.

### Make options reactive

A plain options object is read once. To make an option follow a component property, pass a factory that returns the options:

```ts
init() {
  this.searcher = scope.createDebouncer(search, () => ({ wait: this.wait }))
}
```

Property getters such as `get wait() { return this.wait }` work too.

When an option changes, the adapter updates the same utility. Pending work and state survive. A changed `wait` applies to the next call. It does not reschedule a timer that is already running. Setting `enabled` to `false` cancels pending work. `key`, `initialState`, and `initialItems` apply only when the utility is created.

### Run async work

The async methods await your function, track execution state, and report errors. This search debounces the request and shows a loading state:

```ts
import Alpine from 'alpinejs'
import { createPacerScope } from '@tanstack/alpine-pacer'
import type { AlpineAsyncDebouncer } from '@tanstack/alpine-pacer'

type Search = (term: string) => Promise<Array<SearchResult>>

Alpine.data('asyncSearch', () => {
  const scope = createPacerScope()

  return {
    results: [] as Array<SearchResult>,
    searcher: null as AlpineAsyncDebouncer<
      Search,
      { isExecuting: boolean }
    > | null,
    init() {
      this.searcher = scope.createAsyncDebouncer(
        async (term: string) => {
          const data = await fetchSearchResults(term)
          this.results = data
          return data
        },
        {
          wait: 300,
          onError: (error) => console.error('Search failed:', error),
        },
        (state) => ({ isExecuting: state.isExecuting }),
      )
    },
    destroy() {
      scope.destroy()
    },
  }
})
```

```html
<div x-data="asyncSearch">
  <input @input="searcher.maybeExecute($event.target.value)" />
  <p x-show="searcher.state.isExecuting">Loading...</p>
  <ul>
    <template x-for="result in results" :key="result.id">
      <li x-text="result.title"></li>
    </template>
  </ul>
</div>
```

`maybeExecute` returns a promise that resolves with your function's result. The async utilities also support retries and cancellation through an `AbortSignal`. See the [Async Debouncing Guide](./guides/async-debouncing.md).

### Limit how often an action runs

A rate limiter allows a fixed number of calls per window and rejects the rest:

```ts
init() {
  this.limiter = scope.createRateLimiter(
    (message: string) => sendMessage(message),
    {
      limit: 5,
      window: 60_000,
      onReject: (limiter) =>
        alert(`Slow down. Try again in ${limiter.getMsUntilNextWindow()} ms.`),
    },
    (state) => ({ rejectionCount: state.rejectionCount }),
  )
}
```

```html
<button @click="limiter.maybeExecute('Hello')">Send</button>
<p>Rejected: <span x-text="limiter.state.rejectionCount"></span></p>
```

### Process items in order

A queuer keeps every item and processes them in order. With `createAsyncQueuer`, `concurrency` sets how many run at once:

```ts
init() {
  this.queue = scope.createAsyncQueuer(
    async (file: File) => uploadFile(file),
    { concurrency: 3 },
    (state) => ({ size: state.size, activeItems: state.activeItems }),
  )
},
onFiles(event: Event) {
  const files = (event.target as HTMLInputElement).files
  for (const file of files ?? []) this.queue!.addItem(file)
},
```

```html
<input type="file" multiple @change="onFiles" />
<p>
  Uploading <span x-text="queue.state.activeItems.length"></span>, waiting
  <span x-text="queue.state.size"></span>
</p>
```

## Set default options

Pass default options to `createPacerScope`. Every utility created through that scope uses them, and options passed to a utility override them.

```ts
const scope = createPacerScope({
  debouncer: { wait: 500 },
  asyncQueuer: { concurrency: 3 },
  rateLimiter: { limit: 5, window: 60_000 },
})
```

To read component properties in the defaults, pass a factory that returns the object.

To share options between specific utilities instead, define them once with an option helper. Helpers such as `debouncerOptions` return the object you pass in, typed for that utility:

```ts
import { debouncerOptions } from '@tanstack/alpine-pacer'

const searchOptions = debouncerOptions({ wait: 500, leading: false })

// In init()
this.searcher = scope.createDebouncer(search, {
  ...searchOptions,
  key: 'search',
})
```

## Control cleanup

When the scope is destroyed, debouncers, throttlers, and batchers cancel pending work, and queuers stop processing. Async utilities also abort active work. To keep work instead, pass `onUnmount`. It replaces the default cleanup:

```ts
this.saver = scope.createDebouncer(saveDraft, {
  wait: 1000,
  onUnmount: (debouncer) => debouncer.flush(),
})
```

## Set up devtools

Install the devtools packages:

```sh
npm install @tanstack/devtools @tanstack/pacer-devtools
```

Alpine uses the framework-independent devtools. Mount `TanStackDevtoolsCore` with `plugins: [pacerDevtoolsPlugin()]` from a dedicated Alpine component, and unmount it in that component's `destroy()` hook. The [Alpine devtools setup](../../devtools.md#alpine) has the full code.

A utility appears in the Pacer panel only when you give it a `key` option.

## Next steps

- [Which Pacer Utility Should I Choose?](../../guides/which-pacer-utility-should-i-choose.md) compares all five utilities.
- The [Debouncing](./guides/debouncing.md), [Throttling](./guides/throttling.md), [Rate Limiting](./guides/rate-limiting.md), [Queuing](./guides/queuing.md), and [Batching](./guides/batching.md) guides cover each utility's options and state. Each has an async counterpart.
- The [Alpine API Reference](./reference/index.md) lists every function and its options.
- The [Alpine examples](./examples/createDebouncer) are runnable apps for each utility.
