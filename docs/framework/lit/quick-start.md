---
title: Lit Quick Start
id: quick-start
redirectFrom:
  - framework/lit/adapter
---

TanStack Pacer controls when your functions run. The Lit adapter, `@tanstack/lit-pacer`, wraps each Pacer utility in a `create*` function that takes your element as its first argument. The function registers a reactive controller on the element. The controller re-renders the element when selected state changes and cleans up pending work when the element disconnects.

This page starts with a debounced search input, then covers the patterns most apps need next.

## Installation

```sh
npm install @tanstack/lit-pacer
```

The adapter re-exports everything from `@tanstack/pacer`, so you do not need to install the core package. See [Installation](../../installation.md) for other package managers.

The examples on this page declare reactive properties with `static properties` and class field initializers. For Lit to install its property accessors, set `"useDefineForClassFields": false` in your `tsconfig.json`.

## Your first debouncer

The element below is complete. The input updates on every keystroke. The debounced query updates 500 ms after the user stops typing.

```ts
import { LitElement, html } from 'lit'
import { createDebouncedValue } from '@tanstack/lit-pacer'

class SearchBox extends LitElement {
  static properties = { query: { state: true } }
  query = ''

  debounced = createDebouncedValue(this, () => this.query, { wait: 500 })

  override render() {
    const [debouncedQuery] = this.debounced
    return html`
      <input
        .value=${this.query}
        @input=${(e: Event) => {
          this.query = (e.target as HTMLInputElement).value
        }}
        placeholder="Search..."
      />
      <p>Searching for: ${debouncedQuery()}</p>
    `
  }
}

customElements.define('search-box', SearchBox)
```

`createDebouncedValue` takes a getter, `() => this.query`, and reads it each time the element updates. It returns `[debouncedValue, debouncer]`, where `debouncedValue` is a getter. Pass the debounced value to your data fetching instead of `query`, and a fast typist sends one request instead of one per keystroke.

## Pick a function

Every utility comes in several shapes. They share one engine and differ in what they hand back to you. For debouncing:

| Function               | Returns                        | Use it when                                                   |
| ---------------------- | ------------------------------ | ------------------------------------------------------------- |
| `createDebouncedValue` | `[debouncedValue, debouncer]`  | You already have a property and want a lagging copy           |
| `createDebouncedState` | `[value, setValue, debouncer]` | You want a value with a debounced setter                      |
| `createDebouncer`      | The debouncer instance         | You need `maybeExecute`, `flush`, `cancel`, or reactive state |

The other utilities follow the same naming pattern:

| Utility       | Instance function   | Async instance function  | Guide                                      |
| ------------- | ------------------- | ------------------------ | ------------------------------------------ |
| Debouncing    | `createDebouncer`   | `createAsyncDebouncer`   | [Debouncing](./guides/debouncing.md)       |
| Throttling    | `createThrottler`   | `createAsyncThrottler`   | [Throttling](./guides/throttling.md)       |
| Rate limiting | `createRateLimiter` | `createAsyncRateLimiter` | [Rate Limiting](./guides/rate-limiting.md) |
| Queuing       | `createQueuer`      | `createAsyncQueuer`      | [Queuing](./guides/queuing.md)             |
| Batching      | `createBatcher`     | `createAsyncBatcher`     | [Batching](./guides/batching.md)           |

Each instance function also has a controller class, such as `DebouncerController`, if you prefer to construct controllers yourself. The controller exposes the utility as `.pacer` and the selected state as `.state`.

Not sure which utility you need? Read [Which Pacer Utility Should I Choose?](../../guides/which-pacer-utility-should-i-choose.md).

## Common patterns

### Control the debouncer directly

`createDebouncer` returns the instance. Call `maybeExecute` from your event handler, and use `flush` or `cancel` when the user acts before the timer fires.

```ts
import { LitElement, html } from 'lit'
import { createDebouncer } from '@tanstack/lit-pacer'

class DraftEditor extends LitElement {
  static properties = { draft: { state: true } }
  draft = ''

  saver = createDebouncer(
    this,
    (text: string) => saveDraft(text),
    { wait: 1000 },
    (state) => ({ isPending: state.isPending }),
  )

  onInput = (e: Event) => {
    this.draft = (e.target as HTMLTextAreaElement).value
    this.saver.maybeExecute(this.draft)
  }

  override render() {
    return html`
      <textarea .value=${this.draft} @input=${this.onInput}></textarea>
      <button @click=${() => this.saver.flush()}>Save now</button>
      <button @click=${() => this.saver.cancel()}>Discard</button>
      ${this.saver.state.isPending ? html`<p>Unsaved changes...</p>` : null}
    `
  }
}

customElements.define('draft-editor', DraftEditor)
```

### Select the state you render

The last argument is a selector. Read the selected fields from `this.saver.state`. Without a selector, it is `{}` and never changes. Select only the fields you render, because each change to the selection requests an update of the element.

A child element can subscribe to the same utility with its own selector. Call `subscribe` once, passing the child element. It returns a getter for the selection, and only the child updates when the selection changes. The subscription is released when the child disconnects and restored when it reconnects.

```ts
const status = saver.subscribe(childElement, (state) => ({
  isPending: state.isPending,
}))

// In the child's render method
status().isPending
```

Each utility's guide lists the state fields it exposes.

### Make options reactive

To make an option follow a reactive property, pass a factory that returns the options. The controller calls it before each update of the element:

```ts
class SearchBox extends LitElement {
  static properties = { wait: { type: Number } }
  wait = 300

  searcher = createDebouncer(this, search, () => ({ wait: this.wait }))
}
```

Property getters such as `get wait() { return this.wait }` work too. A plain object such as `{ wait: this.wait }` reads the property once.

When an option changes, the adapter updates the same utility. Pending work and state survive. A changed `wait` applies to the next call. It does not reschedule a timer that is already running. Setting `enabled` to `false` cancels pending work. `key`, `initialState`, and `initialItems` apply only when the utility is created.

### Run async work

The async functions await your function, track execution state, and report errors. This search debounces the request and shows a loading state:

```ts
import { LitElement, html } from 'lit'
import { createAsyncDebouncer } from '@tanstack/lit-pacer'

class AsyncSearch extends LitElement {
  static properties = { results: { state: true } }
  results: Array<SearchResult> = []

  searcher = createAsyncDebouncer(
    this,
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

  override render() {
    return html`
      <input
        @input=${(e: Event) =>
          this.searcher.maybeExecute((e.target as HTMLInputElement).value)}
      />
      ${this.searcher.state.isExecuting ? html`<p>Loading...</p>` : null}
      <ul>
        ${this.results.map((result) => html`<li>${result.title}</li>`)}
      </ul>
    `
  }
}

customElements.define('async-search', AsyncSearch)
```

`maybeExecute` returns a promise that resolves with your function's result. The async utilities also support retries and cancellation through an `AbortSignal`. See the [Async Debouncing Guide](./guides/async-debouncing.md).

### Limit how often an action runs

A rate limiter allows a fixed number of calls per window and rejects the rest:

```ts
import { LitElement, html } from 'lit'
import { createRateLimiter } from '@tanstack/lit-pacer'

class SendButton extends LitElement {
  limiter = createRateLimiter(
    this,
    (message: string) => sendMessage(message),
    {
      limit: 5,
      window: 60_000,
      onReject: (limiter) =>
        alert(`Slow down. Try again in ${limiter.getMsUntilNextWindow()} ms.`),
    },
    (state) => ({ rejectionCount: state.rejectionCount }),
  )

  override render() {
    return html`
      <button @click=${() => this.limiter.maybeExecute('Hello')}>Send</button>
      <p>Rejected: ${this.limiter.state.rejectionCount}</p>
    `
  }
}

customElements.define('send-button', SendButton)
```

### Process items in order

A queuer keeps every item and processes them in order. With `createAsyncQueuer`, `concurrency` sets how many run at once:

```ts
import { LitElement, html } from 'lit'
import { createAsyncQueuer } from '@tanstack/lit-pacer'

class Uploader extends LitElement {
  queue = createAsyncQueuer(
    this,
    async (file: File) => uploadFile(file),
    { concurrency: 3 },
    (state) => ({ size: state.size, activeItems: state.activeItems }),
  )

  onFiles = (e: Event) => {
    const files = (e.target as HTMLInputElement).files
    for (const file of files ?? []) this.queue.addItem(file)
  }

  override render() {
    const { activeItems, size } = this.queue.state
    return html`
      <input type="file" multiple @change=${this.onFiles} />
      <p>Uploading ${activeItems.length}, waiting ${size}</p>
    `
  }
}

customElements.define('file-uploader', Uploader)
```

## Set default options

Call `providePacerOptions(host, defaults)` in an element's constructor or field initializer. The defaults apply to Pacer utilities on that element and on its descendant elements, including across shadow roots. The nearest provider wins, and options passed to a utility override the defaults.

```ts
import { LitElement, html } from 'lit'
import { providePacerOptions } from '@tanstack/lit-pacer'

class AppRoot extends LitElement {
  constructor() {
    super()
    providePacerOptions(this, {
      debouncer: { wait: 500 },
      asyncQueuer: { concurrency: 3 },
      rateLimiter: { limit: 5, window: 60_000 },
    })
  }

  override render() {
    return html`<slot></slot>`
  }
}
```

To read reactive properties of the provider element, pass a factory instead of an object. Descendants receive the new defaults when the provider updates.

To share options between specific utilities instead, define them once with an option helper. Helpers such as `debouncerOptions` return the object you pass in, typed for that utility:

```ts
import { createDebouncer, debouncerOptions } from '@tanstack/lit-pacer'

const searchOptions = debouncerOptions({ wait: 500, leading: false })

// In an element class
searcher = createDebouncer(this, search, { ...searchOptions, key: 'search' })
```

## Control cleanup

When the element disconnects, debouncers, throttlers, and batchers cancel pending work, and queuers stop processing. Async utilities also abort active work. If the element reconnects, the same utility subscribes again.

To keep work instead, pass `onUnmount`. It replaces the default cleanup:

```ts
saver = createDebouncer(this, saveDraft, {
  wait: 1000,
  onUnmount: (debouncer) => debouncer.flush(),
})
```

## Set up devtools

Install the devtools packages:

```sh
npm install @tanstack/devtools @tanstack/pacer-devtools
```

Lit uses the framework-independent devtools. Mount `TanStackDevtoolsCore` with `plugins: [pacerDevtoolsPlugin()]` once in your application, and unmount it when your root element disconnects. The [Lit devtools setup](../../devtools.md#lit) has the full mount and cleanup code.

A utility appears in the Pacer panel only when you give it a `key` option.

## Next steps

- [Which Pacer Utility Should I Choose?](../../guides/which-pacer-utility-should-i-choose.md) compares all five utilities.
- The [Debouncing](./guides/debouncing.md), [Throttling](./guides/throttling.md), [Rate Limiting](./guides/rate-limiting.md), [Queuing](./guides/queuing.md), and [Batching](./guides/batching.md) guides cover each utility's options and state. Each has an async counterpart.
- The [Lit API Reference](./reference/index.md) lists every function, controller, and option.
- The [Lit examples](./examples/createDebouncer) are runnable apps for each function.
