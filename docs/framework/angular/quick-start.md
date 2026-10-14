---
title: Angular Quick Start
id: quick-start
redirectFrom:
  - framework/angular/adapter
---

TanStack Pacer controls when your functions run. The Angular adapter, `@tanstack/angular-pacer`, wraps each Pacer utility in an `inject*` function. Call it in an injection context, such as a component field initializer. The utility cleans up when the component is destroyed and exposes the state you select as a signal.

Angular 20 and up are supported, including all Angular LTS versions.

This page starts with a debounced search input, then covers the patterns most apps need next.

## Installation

```sh
npm install @tanstack/angular-pacer
```

The adapter re-exports everything from `@tanstack/pacer`, so you do not need to install the core package. See [Installation](../../installation.md) for other package managers.

Feature entry points also export their corresponding core utilities alongside the Angular APIs:

```ts
import { Debouncer, injectDebouncer } from '@tanstack/angular-pacer/debouncer'
```

## Your first debouncer

The component below is complete. The input updates on every keystroke. `debouncedQuery()` updates 500 ms after the user stops typing.

```ts
import { Component, signal } from '@angular/core'
import { injectDebouncedValue } from '@tanstack/angular-pacer'

@Component({
  selector: 'app-search',
  template: `
    <input
      [value]="query()"
      (input)="query.set($any($event.target).value)"
      placeholder="Search..."
    />
    <p>Searching for: {{ debouncedQuery() }}</p>
  `,
})
export class SearchComponent {
  readonly query = signal('')
  readonly debouncedQuery = injectDebouncedValue(this.query, { wait: 500 })
}
```

Pass `debouncedQuery` to your data fetching instead of `query`, and a fast typist sends one request instead of one per keystroke.

## Pick a function

Every utility comes in several shapes. They share one engine and differ in what they hand back to you. For debouncing:

| Function                | Returns                                                      | Use it when                                                   |
| ----------------------- | ------------------------------------------------------------ | ------------------------------------------------------------- |
| `injectDebouncedValue`  | A signal of the debounced value, with a `debouncer` property | You already have a signal and want a lagging copy             |
| `injectDebouncedSignal` | A signal with a debounced `set` and a `debouncer` property   | You want `signal()` with a debounced setter                   |
| `injectDebouncer`       | A ref with methods and selected state                                       | You need `maybeExecute`, `flush`, `cancel`, or reactive state |

Editable helpers return an Angular `WritableSignal` with paced `set` and `update` methods, a live `asReadonly()` view, and an attached utility ref. `set` accepts a replacement value; `update` accepts an updater that runs against the committed value when the paced write executes. This applies to `injectDebouncedSignal`, `injectThrottledSignal`, `injectRateLimitedSignal`, and `injectQueuedSignal`.

The corresponding `Value` helpers observe a source signal or accessor. `injectQueuerItems` and `injectAsyncQueuerItems` expose pending queue items with a `queuer` attribute and an `addItem` shortcut.

The other utilities follow the same naming pattern:

| Utility       | Instance function   | Async instance function  | Guide                                      |
| ------------- | ------------------- | ------------------------ | ------------------------------------------ |
| Debouncing    | `injectDebouncer`   | `injectAsyncDebouncer`   | [Debouncing](./guides/debouncing.md)       |
| Throttling    | `injectThrottler`   | `injectAsyncThrottler`   | [Throttling](./guides/throttling.md)       |
| Rate limiting | `injectRateLimiter` | `injectAsyncRateLimiter` | [Rate Limiting](./guides/rate-limiting.md) |
| Queuing       | `injectQueuer`      | `injectAsyncQueuer`      | [Queuing](./guides/queuing.md)             |
| Batching      | `injectBatcher`     | `injectAsyncBatcher`     | [Batching](./guides/batching.md)           |

Not sure which utility you need? Read [Which Pacer Utility Should I Choose?](../../guides/which-pacer-utility-should-i-choose.md).

## Common patterns

### Control the debouncer directly

`injectDebouncer` returns a ref with stable methods and selected state. Call `maybeExecute` from your event handler, and use `flush` or `cancel` when the user acts before the timer fires.

```ts
import { Component, signal } from '@angular/core'
import { injectDebouncer } from '@tanstack/angular-pacer'

@Component({
  selector: 'app-draft-editor',
  template: `
    <textarea [value]="draft()" (input)="onInput($event)"></textarea>
    <button (click)="saver.flush()">Save now</button>
    <button (click)="saver.cancel()">Discard</button>
    @if (saver.state().isPending) {
      <p>Unsaved changes...</p>
    }
  `,
})
export class DraftEditorComponent {
  readonly draft = signal('')

  readonly saver = injectDebouncer(
    (text: string) => saveDraft(text),
    { wait: 1000 },
    (state) => ({ isPending: state.isPending }),
  )

  onInput(event: Event) {
    const value = (event.target as HTMLTextAreaElement).value
    this.draft.set(value)
    this.saver.maybeExecute(value)
  }
}
```

### Select the state you render

The third argument is a selector. `saver.state` is a signal, so call `saver.state()` to read it. Without a selector, it returns `{}` and never changes. Select only the fields your template reads, so other state changes do not trigger change detection.

Value, signal, and items helpers also accept a selector as their third argument. Their selected state is available on the attached utility ref.

Each utility's guide lists the state fields it exposes.

### Make options reactive

A plain options object is read once. To make an option follow a signal or an input, pass a factory that returns the options:

```ts
import { Component, input } from '@angular/core'
import { injectDebouncer } from '@tanstack/angular-pacer'

@Component({ selector: 'app-search', template: `...` })
export class SearchComponent {
  readonly wait = input.required<number>()

  readonly searcher = injectDebouncer(
    (query: string) => this.fetchResults(query),
    () => ({ wait: this.wait() }),
  )
}
```

Passing `{ wait: this.wait() }` instead uses the value at the time of the call.

### Run async work

The async functions await your function, track execution state, and report errors. This search debounces the request and shows a loading state:

```ts
import { Component, signal } from '@angular/core'
import { injectAsyncDebouncer } from '@tanstack/angular-pacer'

@Component({
  selector: 'app-async-search',
  template: `
    <input (input)="searcher.maybeExecute($any($event.target).value)" />
    @if (searcher.state().isExecuting) {
      <p>Loading...</p>
    }
    <ul>
      @for (result of results(); track result.id) {
        <li>{{ result.title }}</li>
      }
    </ul>
  `,
})
export class AsyncSearchComponent {
  readonly results = signal<Array<SearchResult>>([])

  readonly searcher = injectAsyncDebouncer(
    async (term: string) => {
      const data = await fetchSearchResults(term)
      this.results.set(data)
      return data
    },
    {
      wait: 300,
      onError: (error) => console.error('Search failed:', error),
    },
    (state) => ({ isExecuting: state.isExecuting }),
  )
}
```

`maybeExecute` returns a promise that resolves with your function's result. The async utilities also support retries and cancellation through an `AbortSignal`. See the [Async Debouncing Guide](./guides/async-debouncing.md).

### Limit how often an action runs

A rate limiter allows a fixed number of calls per window and rejects the rest:

```ts
import { Component } from '@angular/core'
import { injectRateLimiter } from '@tanstack/angular-pacer'

@Component({
  selector: 'app-send-button',
  template: `
    <button (click)="limiter.maybeExecute('Hello')">Send</button>
    <p>Rejected: {{ limiter.state().rejectionCount }}</p>
  `,
})
export class SendButtonComponent {
  readonly limiter = injectRateLimiter(
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

### Process items in order

A queuer keeps every item and processes them in order. With `injectAsyncQueuer`, `concurrency` sets how many run at once:

```ts
import { Component } from '@angular/core'
import { injectAsyncQueuer } from '@tanstack/angular-pacer'

@Component({
  selector: 'app-uploader',
  template: `
    <input type="file" multiple (change)="onFiles($event)" />
    <p>
      Uploading {{ queue.state().activeItems.length }}, waiting
      {{ queue.state().size }}
    </p>
  `,
})
export class UploaderComponent {
  readonly queue = injectAsyncQueuer(
    async (file: File) => uploadFile(file),
    { concurrency: 3 },
    (state) => ({ size: state.size, activeItems: state.activeItems }),
  )

  onFiles(event: Event) {
    const files = (event.target as HTMLInputElement).files
    for (const file of files ?? []) this.queue.addItem(file)
  }
}
```

## Set default options

`providePacerOptions` sets default options for every Pacer utility in the injector tree where you provide it. Options passed to an `inject*` function override the defaults.

```ts
import { providePacerOptions } from '@tanstack/angular-pacer'
import type { ApplicationConfig } from '@angular/core'

export const appConfig: ApplicationConfig = {
  providers: [
    providePacerOptions({
      debouncer: { wait: 500 },
      asyncQueuer: { concurrency: 3 },
      rateLimiter: { limit: 5, window: 60_000 },
    }),
  ],
}
```

You can also pass a factory to `providePacerOptions`; it runs in the provider injection context and can call `inject()`. Continue to pass required options, such as `wait`, or `limit` and `window`, when creating a utility.

To share options between specific utilities instead, define them once with an option helper. Helpers such as `debouncerOptions` return the object you pass in, typed for that utility:

```ts
import { debouncerOptions, injectDebouncer } from '@tanstack/angular-pacer'

const searchOptions = debouncerOptions({ wait: 500, leading: false })

// In a component field
readonly debouncer = injectDebouncer(search, { ...searchOptions, key: 'search' })
```

## Control cleanup

When the component is destroyed, debouncers, throttlers, and batchers cancel pending work, and queuers stop processing. Async utilities also abort active work. To keep work instead, pass `onUnmount`. It replaces the default cleanup:

```ts
readonly saver = injectDebouncer(saveDraft, {
  wait: 1000,
  onUnmount: (debouncer) => debouncer.flush(),
})
```

## Testing

The adapter integrates with Angular's pending tasks so `fixture.whenStable()` waits for scheduled and asynchronous Pacer work. Wait for stability before checking the rendered result:

```ts
import { Component } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { injectDebouncedSignal } from '@tanstack/angular-pacer'

@Component({ template: '<p>{{ value() }}</p>' })
class ExampleComponent {
  readonly value = injectDebouncedSignal('initial', { wait: 50 })
}

it('renders the debounced value', async () => {
  const fixture = TestBed.createComponent(ExampleComponent)
  fixture.detectChanges()

  fixture.componentInstance.value.set('updated')
  fixture.detectChanges()
  await fixture.whenStable()

  expect(fixture.nativeElement.textContent).toContain('updated')
})
```

This example uses real timers. When using fake timers, advance them to complete the scheduled work before awaiting stability.

## Set up devtools

Install the devtools packages:

```sh
npm install @tanstack/angular-devtools @tanstack/angular-pacer-devtools
```

Add the devtools provider in `app.config.ts`. You do not need to add a component to your template.

```ts
import { isDevMode } from '@angular/core'
import { provideTanStackDevtools } from '@tanstack/angular-devtools/provider'
import { pacerDevtoolsPlugin } from '@tanstack/angular-pacer-devtools'
import type { ApplicationConfig } from '@angular/core'

export const appConfig: ApplicationConfig = {
  providers: [
    ...(isDevMode()
      ? [
          provideTanStackDevtools(() => ({
            plugins: [pacerDevtoolsPlugin()],
          })),
        ]
      : []),
  ],
}
```

A utility appears in the Pacer panel only when you give it a `key` option. See [Devtools](../../devtools.md) for production builds.

## Next steps

- [Which Pacer Utility Should I Choose?](../../guides/which-pacer-utility-should-i-choose.md) compares all five utilities.
- The [Debouncing](./guides/debouncing.md), [Throttling](./guides/throttling.md), [Rate Limiting](./guides/rate-limiting.md), [Queuing](./guides/queuing.md), and [Batching](./guides/batching.md) guides cover each utility's options and state. Each has an async counterpart.
- The [Angular API Reference](./reference/index.md) lists every inject function and its options.
- The [Angular examples](./examples/injectDebouncer) are runnable apps for each function.
