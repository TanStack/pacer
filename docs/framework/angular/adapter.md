---
title: TanStack Pacer Angular Adapter
id: adapter
---

If you are using TanStack Pacer in an Angular application, we recommend using the Angular Adapter. The Angular Adapter provides inject functions that wrap the core Pacer utilities and integrate with Angular's dependency injection and signals. If you need to use the core Pacer classes or functions directly, the Angular Adapter also re-exports everything from the core package.

## Installation

```sh
npm install @tanstack/angular-pacer
```

## Angular inject API

See the [Angular inject API Reference](./reference/index.md) for the full list of inject functions (injectDebouncer, injectThrottler, injectRateLimiter, injectQueuer, injectBatcher, and their async and callback variants).

## Basic usage

Inject a Pacer utility in your component or service. Each inject function returns an object that exposes methods and a reactive `state()` signal when you pass a selector.

```ts
import { Component, signal } from '@angular/core'
import { injectDebouncer } from '@tanstack/angular-pacer'

@Component({
  selector: 'app-root',
  template: `
    <input [value]="query()" (input)="onInput($event)" placeholder="Search..." />
    <p>Pending: {{ debouncer.state().isPending }}</p>
    <p>Debounced: {{ debounced() }}</p>
  `,
})
export class App {
  protected readonly query = signal('')
  protected readonly debounced = signal('')

  protected readonly debouncer = injectDebouncer(
    (q: string) => {
      this.debounced.set(q)
    },
    { wait: 500 },
    (state) => ({ isPending: state.isPending }),
  )

  protected onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value
    this.query.set(value)
    this.debouncer.maybeExecute(value)
  }
}
```

You can also import core Pacer APIs re-exported from the adapter.

```ts
import { debounce, Debouncer } from '@tanstack/angular-pacer'
```

## Provider

Use `providePacerOptions` in your application config to set default options for all Pacer utilities in the app. Options passed to individual inject functions override these defaults.

```ts
import { ApplicationConfig } from '@angular/core'
import { providePacerOptions } from '@tanstack/angular-pacer'

export const appConfig: ApplicationConfig = {
  providers: [
    providePacerOptions({
      debouncer: { wait: 300 },
      throttler: { wait: 100 },
      asyncQueuer: { concurrency: 2 },
      rateLimiter: { limit: 5, window: 60000 },
    }),
  ],
}
```

## State selector

The third argument to each inject function is a state selector. It determines which slice of state is exposed on the returned object's `state()` signal, so only relevant changes trigger template updates.

**By default, if you omit the selector, `state()` is not populated.** Pass a selector to opt in to reactive state.

```ts
// No selector: state() is not populated
const debouncer = injectDebouncer(fn, { wait: 500 })

// With selector: state() is a signal of the selected slice
const debouncer = injectDebouncer(
  fn,
  { wait: 500 },
  (state) => ({ isPending: state.isPending }),
)
```

For more on state and options per utility, see the guides (e.g. [Debouncing Guide](./guides/debouncing.md), [Rate Limiting Guide](./guides/rate-limiting.md)).

## Examples

### Debouncer

```ts
import { Component, signal } from '@angular/core'
import { injectDebouncer } from '@tanstack/angular-pacer'

@Component({
  selector: 'app-search',
  template: `
    <input [value]="query()" (input)="onInput($event)" placeholder="Search..." />
  `,
})
export class SearchComponent {
  protected readonly query = signal('')

  protected readonly debouncer = injectDebouncer(
    (q: string) => console.log('Searching for', q),
    { wait: 500 },
  )

  protected onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value
    this.query.set(value)
    this.debouncer.maybeExecute(value)
  }
}
```

### Async Queuer

```ts
import { Component, signal } from '@angular/core'
import { injectAsyncQueuer } from '@tanstack/angular-pacer'

@Component({
  selector: 'app-upload',
  template: `
    <input type="file" multiple (change)="onFiles($event)" />
    <p>Queue size: {{ queuer.state().size }}</p>
  `,
})
export class UploadComponent {
  protected readonly queuer = injectAsyncQueuer<File, { size: number }>(
    async (file) => {
      await uploadFile(file)
    },
    { concurrency: 3 },
    (state) => ({ size: state.size }),
  )

  protected onFiles(event: Event): void {
    const files = (event.target as HTMLInputElement).files
    if (files) {
      Array.from(files).forEach((file) => this.queuer.addItem(file))
    }
  }
}
```

### Rate Limiter

```ts
import { Component } from '@angular/core'
import { injectRateLimiter } from '@tanstack/angular-pacer'

@Component({
  selector: 'app-api',
  template: `
    <button (click)="submit()">Submit</button>
    <p>Rejections: {{ rateLimiter.state().rejectionCount }}</p>
  `,
})
export class ApiComponent {
  protected readonly rateLimiter = injectRateLimiter<string, { rejectionCount: number }>(
    (data) =>
      fetch('/api/endpoint', {
        method: 'POST',
        body: JSON.stringify({ data }),
      }),
    {
      limit: 5,
      window: 60000,
      onReject: () => alert('Rate limit reached. Try again later.'),
    },
    (state) => ({ rejectionCount: state.rejectionCount }),
  )

  protected submit(): void {
    this.rateLimiter.maybeExecute('payload')
  }
}
```

## Reactive options

Use property getters or an options factory to read Angular signals:

```ts
const wait = signal(300)
const debouncer = injectDebouncer(save, {
  get wait() {
    return wait()
  },
})

wait.set(600)
```

Factories also work with required component inputs:

```ts
import { input } from '@angular/core'
import { injectDebouncer } from '@tanstack/angular-pacer'

readonly wait = input.required<number>()
readonly search = injectDebouncer(
  (query: string) => this.fetchResults(query),
  () => ({ wait: this.wait() }),
)
```

Getter-based options and factories defer initialization until Angular's first effect, after component inputs are bound, or until you first access the returned utility. Accessing the utility before a required input is available throws Angular's required-input error. Destroying the component before initialization does not read those options or create a utility. Plain objects without getters initialize eagerly when their provider defaults also contain no getters.

Later signal changes update the same utility through `setOptions` during change detection. Provider defaults are read during option tracking, and local options override them. This contract applies to synchronous and asynchronous inject functions and their callback, signal, and value helpers.

Reading a signal before passing the options, such as `{ wait: wait() }`, produces a snapshot. Assigning to an ordinary object property does not trigger an update. Use a getter or factory for reactive values. Option reads are shallow: build nested configurations inside a getter or factory when they depend on signals. Callbacks and function-valued core options remain functions. Getters and factories should read signals and return options without side effects.

Updates preserve the utility, store, queued items, and pending work. Changing `wait` does not reschedule an existing timer. Setting `enabled` to `false` still applies the utility's normal cancellation behavior. Construction options such as `key`, `initialState`, and `initialItems` apply only when the utility is created. Use `start()` and `stop()` to change running queues.

Updates follow `setOptions` merge semantics. If a factory omits a previously supplied field, the provider default replaces it when one exists; otherwise, its previous value remains. Return `undefined` explicitly to clear an optional field. For example, `onUnmount: undefined` restores default cleanup. Disposal uses the latest `onUnmount` callback. The utility's `options` property exposes its current core options, including manual `setOptions` updates.

For a value helper with an explicit initial value and factory options, pass a fourth argument for the selector. Pass `undefined` when no selector is needed:

```ts
const debounced = injectDebouncedValue(
  query,
  '',
  () => ({ wait: wait() }),
  undefined,
)
```

The fourth argument distinguishes this form from `injectDebouncedValue(query, optionsFactory, selector)`. Object options still support the existing three-argument form with an initial value.

## Event handlers

Use `injectDebouncer`, `injectThrottler`, or `injectRateLimiter` and call `maybeExecute()` from the event handler. For batching, use `injectBatcher` and call `addItem()`. Async utilities use the same method names.

Store the utility instance in a field when options read required inputs. Accessing a method during field initialization can initialize the utility before Angular binds those inputs.

In a component:

```ts
readonly wait = input.required<number>()
readonly debouncer = injectDebouncer(saveDraft, () => ({ wait: this.wait() }))

save(draft: string) {
  this.debouncer.maybeExecute(draft)
}
```
