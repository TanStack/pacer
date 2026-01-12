<div align="center">
  <img src="./media/header_pacer.png" >
</div>

<br />

<div align="center">
	<a href="https://www.npmjs.com/package/@tanstack/angular-pacer" target="\_parent">
	  <img alt="" src="https://img.shields.io/npm/dm/@tanstack/angular-pacer.svg" alt="npm downloads" />
	</a>
- <a href="https://github.com/TanStack/pacer" target="\_parent">
	  <img alt="" src="https://img.shields.io/github/stars/TanStack/pacer.svg?style=social&label=Star" alt="GitHub stars" />
	</a>
	<a href="https://bundlephobia.com/result?p=@tanstack/angular-pacer@latest" target="\_parent">
  <img alt="" src="https://badgen.net/bundlephobia/minzip/@tanstack/angular-pacer@latest" alt="Bundle size" />
</a>
</div>

<div align="center">
<a href="#badge">
  <img alt="semantic-release" src="https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg">
</a>
	<a href="#badge">
		<img src="https://img.shields.io/github/v/release/tanstack/pacer" alt="Release"/>
	</a>
	<a href="https://twitter.com/tan_stack">
		<img src="https://img.shields.io/twitter/follow/tan_stack.svg?style=social" alt="Follow @TanStack"/>
	</a>
</div>

<div align="center">
  
### [Become a Sponsor!](https://github.com/sponsors/tannerlinsley/)
</div>

# TanStack Pacer - Angular

Angular adapter for TanStack Pacer - A lightweight timing and scheduling library for debouncing, throttling, rate limiting, queuing, and batching with Angular Signals.

## Installation

```bash
npm install @tanstack/angular-pacer @tanstack/pacer
# or
pnpm add @tanstack/angular-pacer @tanstack/pacer
# or
yarn add @tanstack/angular-pacer @tanstack/pacer
```

## Requirements

- Angular 16+ (for Signals support)
- @tanstack/pacer

## Quick Start

### Setup Provider (Optional)

In your `app.config.ts` (standalone) or `app.module.ts` (module-based):

```ts
import { ApplicationConfig } from '@angular/core'
import { providePacerOptions } from '@tanstack/angular-pacer'

export const appConfig: ApplicationConfig = {
  providers: [
    providePacerOptions({
      debouncer: { wait: 300 },
      throttler: { wait: 100 },
    }),
  ],
}
```

### Using Debounced Signals

```ts
import { Component, signal } from '@angular/core'
import { createDebouncedSignal } from '@tanstack/angular-pacer'

@Component({
  selector: 'app-search',
  template: `
    <input
      [value]="searchQuery()"
      (input)="setSearchQuery($any($event.target).value)"
    />
    <p>Debounced: {{ debouncedQuery() }}</p>
  `,
})
export class SearchComponent {
  searchQuery = (signal('')[(debouncedQuery, setSearchQuery)] =
    createDebouncedSignal('', { wait: 500 }))
}
```

### Using Debounced Callbacks

```ts
import { Component } from '@angular/core'
import { createDebouncedCallback } from '@tanstack/angular-pacer'

@Component({
  selector: 'app-search',
  template: ` <input (input)="handleSearch($any($event.target).value)" /> `,
})
export class SearchComponent {
  handleSearch = createDebouncedCallback(
    (query: string) => {
      console.log('Searching for:', query)
    },
    { wait: 500 },
  )
}
```

### Using Throttled Signals

```ts
import { Component, signal } from '@angular/core'
import { createThrottledSignal } from '@tanstack/angular-pacer'

@Component({
  selector: 'app-scroll',
  template: `<div>Scroll Y: {{ scrollY() }}</div>`
})
export class ScrollComponent {
  [scrollY, setScrollY] = createThrottledSignal(0, { wait: 100 })

  ngOnInit() {
    window.addEventListener('scroll', () => {
      setScrollY(window.scrollY)
    })
  }
}
```

### Using Async Debounced Callbacks

```ts
import { Component } from '@angular/core'
import { createAsyncDebouncedCallback } from '@tanstack/angular-pacer'

@Component({
  selector: 'app-search',
  template: `<input (input)="handleSearch($any($event.target).value)" />`,
})
export class SearchComponent {
  handleSearch = createAsyncDebouncedCallback(
    async (query: string) => {
      const response = await fetch(`/api/search?q=${query}`)
      return response.json()
    },
    { wait: 500 },
  )

  async onInput(query: string) {
    const results = await this.handleSearch(query)
    console.log('Results:', results)
  }
}
```

## API Overview

### Sync Utilities

- **Debouncer**: `createDebouncer`, `createDebouncedCallback`, `createDebouncedSignal`, `createDebouncedValue`
- **Throttler**: `createThrottler`, `createThrottledCallback`, `createThrottledSignal`, `createThrottledValue`
- **Rate Limiter**: `createRateLimiter`, `createRateLimitedCallback`, `createRateLimitedSignal`, `createRateLimitedValue`
- **Queuer**: `createQueuer`, `createQueuedSignal`, `createQueuedValue`
- **Batcher**: `createBatcher`, `createBatchedCallback`

### Async Utilities

- **Async Debouncer**: `createAsyncDebouncer`, `createAsyncDebouncedCallback`
- **Async Throttler**: `createAsyncThrottler`, `createAsyncThrottledCallback`
- **Async Rate Limiter**: `createAsyncRateLimiter`, `createAsyncRateLimitedCallback`
- **Async Queuer**: `createAsyncQueuer`, `createAsyncQueuedSignal`
- **Async Batcher**: `createAsyncBatcher`, `createAsyncBatchedCallback`

### Provider

- `providePacerOptions` - Provides default options for all utilities
- `PACER_OPTIONS` - Injection token for accessing options
- `useDefaultPacerOptions` - Function to get default options

## Features

- **Angular Signals Integration**: Full support for Angular Signals (16+)
- **Type Safety**: Full TypeScript support with generics
- **Reactive State**: Uses TanStack Store with Angular Signals for reactive state management
- **Flexible API**: Multiple levels of abstraction to suit your needs
- **Tree Shaking**: Deep imports available for optimal bundle size
- **Provider Support**: Configure default options globally

## Documentation

For detailed documentation, visit [tanstack.com/pacer](https://tanstack.com/pacer)

## Examples

See the [examples directory](../../examples) for more usage examples.

## License

MIT
