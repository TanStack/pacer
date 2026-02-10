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

## Basic Usage

Inject a Pacer utility in your component or service. Each inject function returns an object that exposes methods and a reactive `state()` signal when you pass a selector.

```ts
import { Component, signal } from '@angular/core'
import { injectDebouncer } from '@tanstack/angular-pacer'

@Component({
  selector: 'app-search',
  template: `
    <input [value]="query()" (input)="onInput($event)" placeholder="Search..." />
    <p>Pending: {{ debouncer.state().isPending }}</p>
  `,
})
export class SearchComponent {
  protected readonly query = signal('')

  protected readonly debouncer = injectDebouncer(
    (q: string) => {
      console.log('Searching for', q)
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
      queuer: { concurrency: 2 },
      rateLimiter: { limit: 5, window: 60000 },
    }),
  ],
}
```

## State selector

The third argument to each inject function is a state selector. It determines which slice of state is exposed on the returned object's `state()` signal, so only relevant changes trigger template updates.

**By default, if you omit the selector, `state()` is not populated.** Pass a selector to opt in to reactive state.

```ts
// No selector: state() is not useful for reactivity
const debouncer = injectDebouncer(fn, { wait: 500 })

// With selector: state() is a signal of the selected slice
const debouncer = injectDebouncer(
  fn,
  { wait: 500 },
  (state) => ({ isPending: state.isPending }),
)
```

For more on state and options per utility, see the guides (e.g. [Debouncing Guide](../../guides/debouncing.md), [Rate Limiting Guide](../../guides/rate-limiting.md)).

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

### Queuer

```ts
import { Component, signal } from '@angular/core'
import { injectQueuer } from '@tanstack/angular-pacer'

@Component({
  selector: 'app-upload',
  template: `
    <input type="file" multiple (change)="onFiles($event)" />
    <p>Queue size: {{ queuer.state().size }}</p>
  `,
})
export class UploadComponent {
  protected readonly queuer = injectQueuer<File, { size: number }>(
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
