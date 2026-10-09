---
title: TanStack Pacer Angular Adapter
id: adapter
---

In an Angular application, use the Angular Adapter. Its inject functions wrap the core Pacer utilities with Angular signals and lifecycle cleanup. Angular 20 and up are supported, including all Angular LTS versions.

## Installation

```sh
npm install @tanstack/angular-pacer
```

The Angular adapter also re-exports the core Pacer utilities:

```ts
import { debounce, Debouncer } from '@tanstack/angular-pacer'
```

Feature entry points also export their corresponding core utilities alongside the Angular APIs:

```ts
import { Debouncer, injectDebouncer } from '@tanstack/angular-pacer/debouncer'
```

## Angular inject functions

See the [Angular API Reference](./reference/index.md) for the available utilities, including debouncing, throttling, rate limiting, queuing, and batching.

## Basic usage

Create the utility in a component or service injection context, then call its methods from event handlers.

```ts
import { Component, signal } from '@angular/core'
import { injectDebouncer } from '@tanstack/angular-pacer'

@Component({
  selector: 'app-search',
  template: `
    <input #query (input)="debouncer.maybeExecute(query.value)" />
    <p>{{ result() }}</p>
  `,
})
export class SearchComponent {
  readonly result = signal('')
  readonly debouncer = injectDebouncer(
    (query: string) => this.result.set(query),
    { wait: 300 },
  )
}
```

For editable values, use `injectDebouncedSignal`, `injectThrottledSignal`, `injectRateLimitedSignal`, or `injectQueuedSignal`. They return an Angular signal with `set`, `update`, and an attached utility ref. The corresponding `Computed` helpers observe a source signal or accessor. `injectQueuerItems` and `injectAsyncQueuerItems` expose pending queue items with a `queuer` attribute and an `addItem` shortcut.

## Options

Options can be an object or a function that returns an object. Use a function to read signals or component inputs reactively:

```ts
readonly wait = signal(300)
readonly debouncer = injectDebouncer(
  (query: string) => this.result.set(query),
  () => ({ wait: this.wait() }),
)
```

Passing `{ wait: this.wait() }` instead uses the value at the time of the call.

## Provider

Use `providePacerOptions` to supply defaults at the application, route, or component level. Options passed to an individual utility override these defaults.

```ts
import { ApplicationConfig } from '@angular/core'
import { providePacerOptions } from '@tanstack/angular-pacer'

export const appConfig: ApplicationConfig = {
  providers: [
    providePacerOptions({
      debouncer: { wait: 300 },
      asyncQueuer: { concurrency: 2 },
    }),
  ],
}
```

Continue to pass the required options, such as `wait`, or `limit` and `window`, when creating a utility.

## State selector

The third argument selects the state exposed by `state()`. Without a selector, `state()` returns an empty object.

```ts
readonly debouncer = injectDebouncer(
  (query: string) => this.result.set(query),
  { wait: 300 },
  (state) => ({ isPending: state.isPending }),
)
```

Computed, signal, and items helpers also accept a selector as their third argument. The selected state is available on their attached utility ref, independently of the returned value or items signal.

```ts
readonly queued = injectQueuerItems(
  (job: string) => console.log(job),
  { started: false },
  (state) => ({ size: state.size }),
)
// queued.addItem('job'); queued.queuer.state().size
```

Read the selected state in the template:

```html
<p>Pending: {{ debouncer.state().isPending }}</p>
```

For available state fields and options, see the individual guides, such as [Debouncing](./guides/debouncing.md) and [Rate Limiting](./guides/rate-limiting.md).

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
import { Component } from '@angular/core'
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
  protected readonly rateLimiter = injectRateLimiter(
    (data: string) =>
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
