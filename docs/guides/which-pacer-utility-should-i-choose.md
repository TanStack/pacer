---
title: Which Pacer Utility Should I Choose?
id: which-pacer-utility-should-i-choose
---

TanStack Pacer provides five strategies for controlling when operations run. The right choice depends on what should happen to calls that arrive faster than your application can process them.

## Compare the utilities

<!-- ::start:framework -->

# React

| Utility | What happens to frequent calls? | Best fit |
| --- | --- | --- |
| [Debouncer](../framework/react/guides/debouncing.md) | Earlier calls are discarded. The latest call runs after activity stops. | Search input, validation, autosave |
| [Throttler](../framework/react/guides/throttling.md) | Calls are limited to a steady interval. A trailing call can retain the latest arguments. | Scroll, resize, progress, repeated UI updates |
| [Rate Limiter](../framework/react/guides/rate-limiting.md) | Calls run until a quota is reached. Additional calls are rejected until capacity returns. | Client-side quotas and burst limits |
| [Queuer](../framework/react/guides/queuing.md) | Calls wait in an ordered buffer and run individually. | Work that must not be lost |
| [Batcher](../framework/react/guides/batching.md) | Items accumulate and run together as one batch. | Bulk requests, writes, and analytics events |

# Preact

| Utility | What happens to frequent calls? | Best fit |
| --- | --- | --- |
| [Debouncer](../framework/preact/guides/debouncing.md) | Earlier calls are discarded. The latest call runs after activity stops. | Search input, validation, autosave |
| [Throttler](../framework/preact/guides/throttling.md) | Calls are limited to a steady interval. A trailing call can retain the latest arguments. | Scroll, resize, progress, repeated UI updates |
| [Rate Limiter](../framework/preact/guides/rate-limiting.md) | Calls run until a quota is reached. Additional calls are rejected until capacity returns. | Client-side quotas and burst limits |
| [Queuer](../framework/preact/guides/queuing.md) | Calls wait in an ordered buffer and run individually. | Work that must not be lost |
| [Batcher](../framework/preact/guides/batching.md) | Items accumulate and run together as one batch. | Bulk requests, writes, and analytics events |

# Solid

| Utility | What happens to frequent calls? | Best fit |
| --- | --- | --- |
| [Debouncer](../framework/solid/guides/debouncing.md) | Earlier calls are discarded. The latest call runs after activity stops. | Search input, validation, autosave |
| [Throttler](../framework/solid/guides/throttling.md) | Calls are limited to a steady interval. A trailing call can retain the latest arguments. | Scroll, resize, progress, repeated UI updates |
| [Rate Limiter](../framework/solid/guides/rate-limiting.md) | Calls run until a quota is reached. Additional calls are rejected until capacity returns. | Client-side quotas and burst limits |
| [Queuer](../framework/solid/guides/queuing.md) | Calls wait in an ordered buffer and run individually. | Work that must not be lost |
| [Batcher](../framework/solid/guides/batching.md) | Items accumulate and run together as one batch. | Bulk requests, writes, and analytics events |

# Angular

| Utility | What happens to frequent calls? | Best fit |
| --- | --- | --- |
| [Debouncer](../framework/angular/guides/debouncing.md) | Earlier calls are discarded. The latest call runs after activity stops. | Search input, validation, autosave |
| [Throttler](../framework/angular/guides/throttling.md) | Calls are limited to a steady interval. A trailing call can retain the latest arguments. | Scroll, resize, progress, repeated UI updates |
| [Rate Limiter](../framework/angular/guides/rate-limiting.md) | Calls run until a quota is reached. Additional calls are rejected until capacity returns. | Client-side quotas and burst limits |
| [Queuer](../framework/angular/guides/queuing.md) | Calls wait in an ordered buffer and run individually. | Work that must not be lost |
| [Batcher](../framework/angular/guides/batching.md) | Items accumulate and run together as one batch. | Bulk requests, writes, and analytics events |

# Vue

| Utility | What happens to frequent calls? | Best fit |
| --- | --- | --- |
| [Debouncer](../framework/vue/guides/debouncing.md) | Earlier calls are discarded. The latest call runs after activity stops. | Search input, validation, autosave |
| [Throttler](../framework/vue/guides/throttling.md) | Calls are limited to a steady interval. A trailing call can retain the latest arguments. | Scroll, resize, progress, repeated UI updates |
| [Rate Limiter](../framework/vue/guides/rate-limiting.md) | Calls run until a quota is reached. Additional calls are rejected until capacity returns. | Client-side quotas and burst limits |
| [Queuer](../framework/vue/guides/queuing.md) | Calls wait in an ordered buffer and run individually. | Work that must not be lost |
| [Batcher](../framework/vue/guides/batching.md) | Items accumulate and run together as one batch. | Bulk requests, writes, and analytics events |

# Svelte

| Utility | What happens to frequent calls? | Best fit |
| --- | --- | --- |
| [Debouncer](../framework/svelte/guides/debouncing.md) | Earlier calls are discarded. The latest call runs after activity stops. | Search input, validation, autosave |
| [Throttler](../framework/svelte/guides/throttling.md) | Calls are limited to a steady interval. A trailing call can retain the latest arguments. | Scroll, resize, progress, repeated UI updates |
| [Rate Limiter](../framework/svelte/guides/rate-limiting.md) | Calls run until a quota is reached. Additional calls are rejected until capacity returns. | Client-side quotas and burst limits |
| [Queuer](../framework/svelte/guides/queuing.md) | Calls wait in an ordered buffer and run individually. | Work that must not be lost |
| [Batcher](../framework/svelte/guides/batching.md) | Items accumulate and run together as one batch. | Bulk requests, writes, and analytics events |

# Lit

| Utility | What happens to frequent calls? | Best fit |
| --- | --- | --- |
| [Debouncer](../framework/lit/guides/debouncing.md) | Earlier calls are discarded. The latest call runs after activity stops. | Search input, validation, autosave |
| [Throttler](../framework/lit/guides/throttling.md) | Calls are limited to a steady interval. A trailing call can retain the latest arguments. | Scroll, resize, progress, repeated UI updates |
| [Rate Limiter](../framework/lit/guides/rate-limiting.md) | Calls run until a quota is reached. Additional calls are rejected until capacity returns. | Client-side quotas and burst limits |
| [Queuer](../framework/lit/guides/queuing.md) | Calls wait in an ordered buffer and run individually. | Work that must not be lost |
| [Batcher](../framework/lit/guides/batching.md) | Items accumulate and run together as one batch. | Bulk requests, writes, and analytics events |

# Alpine

| Utility | What happens to frequent calls? | Best fit |
| --- | --- | --- |
| [Debouncer](../framework/alpine/guides/debouncing.md) | Earlier calls are discarded. The latest call runs after activity stops. | Search input, validation, autosave |
| [Throttler](../framework/alpine/guides/throttling.md) | Calls are limited to a steady interval. A trailing call can retain the latest arguments. | Scroll, resize, progress, repeated UI updates |
| [Rate Limiter](../framework/alpine/guides/rate-limiting.md) | Calls run until a quota is reached. Additional calls are rejected until capacity returns. | Client-side quotas and burst limits |
| [Queuer](../framework/alpine/guides/queuing.md) | Calls wait in an ordered buffer and run individually. | Work that must not be lost |
| [Batcher](../framework/alpine/guides/batching.md) | Items accumulate and run together as one batch. | Bulk requests, writes, and analytics events |

# Ember

| Utility | What happens to frequent calls? | Best fit |
| --- | --- | --- |
| [Debouncer](../framework/ember/guides/debouncing.md) | Earlier calls are discarded. The latest call runs after activity stops. | Search input, validation, autosave |
| [Throttler](../framework/ember/guides/throttling.md) | Calls are limited to a steady interval. A trailing call can retain the latest arguments. | Scroll, resize, progress, repeated UI updates |
| [Rate Limiter](../framework/ember/guides/rate-limiting.md) | Calls run until a quota is reached. Additional calls are rejected until capacity returns. | Client-side quotas and burst limits |
| [Queuer](../framework/ember/guides/queuing.md) | Calls wait in an ordered buffer and run individually. | Work that must not be lost |
| [Batcher](../framework/ember/guides/batching.md) | Items accumulate and run together as one batch. | Bulk requests, writes, and analytics events |

# Octane

| Utility | What happens to frequent calls? | Best fit |
| --- | --- | --- |
| [Debouncer](../framework/octane/guides/debouncing.md) | Earlier calls are discarded. The latest call runs after activity stops. | Search input, validation, autosave |
| [Throttler](../framework/octane/guides/throttling.md) | Calls are limited to a steady interval. A trailing call can retain the latest arguments. | Scroll, resize, progress, repeated UI updates |
| [Rate Limiter](../framework/octane/guides/rate-limiting.md) | Calls run until a quota is reached. Additional calls are rejected until capacity returns. | Client-side quotas and burst limits |
| [Queuer](../framework/octane/guides/queuing.md) | Calls wait in an ordered buffer and run individually. | Work that must not be lost |
| [Batcher](../framework/octane/guides/batching.md) | Items accumulate and run together as one batch. | Bulk requests, writes, and analytics events |

# Vanilla

| Utility | What happens to frequent calls? | Best fit |
| --- | --- | --- |
| [Debouncer](../framework/vanilla/guides/debouncing.md) | Earlier calls are discarded. The latest call runs after activity stops. | Search input, validation, autosave |
| [Throttler](../framework/vanilla/guides/throttling.md) | Calls are limited to a steady interval. A trailing call can retain the latest arguments. | Scroll, resize, progress, repeated UI updates |
| [Rate Limiter](../framework/vanilla/guides/rate-limiting.md) | Calls run until a quota is reached. Additional calls are rejected until capacity returns. | Client-side quotas and burst limits |
| [Queuer](../framework/vanilla/guides/queuing.md) | Calls wait in an ordered buffer and run individually. | Work that must not be lost |
| [Batcher](../framework/vanilla/guides/batching.md) | Items accumulate and run together as one batch. | Bulk requests, writes, and analytics events |

<!-- ::end:framework -->

## Choose by required behavior

### Only the final value matters

Use a debouncer. Every call restarts a timer, and the most recent call runs once the calls go quiet.

### Work should continue at a steady pace

Use a throttler. It limits execution frequency without waiting for activity to stop completely.

### A fixed quota must be enforced

Use a rate limiter. It accepts calls until the configured limit is reached, then rejects additional calls within the window.

### Every operation must run

Use a queuer. It preserves pending operations and processes them according to FIFO, LIFO, or priority ordering. A finite `maxSize` can still cause new items to be rejected.

### Several items should run together

Use a batcher. It collects items until a size, time, or custom condition triggers one batch execution.

## Synchronous or asynchronous

Each utility has a synchronous and asynchronous version. Start with the synchronous version unless the utility must manage Promise-specific behavior.

Use the asynchronous version when you need to:

- Await the wrapped function's result.
- Track success, error, and settlement state.
- Configure error propagation.
- Retry failed executions.
- Abort in-flight operations.
- Run queued tasks concurrently with `AsyncQueuer`.

Passing an async function to a synchronous utility does not provide these features. The synchronous utility invokes the function but does not await or manage its Promise.

<!-- ::start:framework -->

# React

| Synchronous | Asynchronous |
| --- | --- |
| [Debouncing](../framework/react/guides/debouncing.md) | [Async debouncing](../framework/react/guides/async-debouncing.md) |
| [Throttling](../framework/react/guides/throttling.md) | [Async throttling](../framework/react/guides/async-throttling.md) |
| [Rate limiting](../framework/react/guides/rate-limiting.md) | [Async rate limiting](../framework/react/guides/async-rate-limiting.md) |
| [Queuing](../framework/react/guides/queuing.md) | [Async queuing](../framework/react/guides/async-queuing.md) |
| [Batching](../framework/react/guides/batching.md) | [Async batching](../framework/react/guides/async-batching.md) |

The async utilities use `AsyncRetryer` internally for retry and abort support. See the [Async Retrying Guide](../framework/react/guides/async-retrying.md).

# Preact

| Synchronous | Asynchronous |
| --- | --- |
| [Debouncing](../framework/preact/guides/debouncing.md) | [Async debouncing](../framework/preact/guides/async-debouncing.md) |
| [Throttling](../framework/preact/guides/throttling.md) | [Async throttling](../framework/preact/guides/async-throttling.md) |
| [Rate limiting](../framework/preact/guides/rate-limiting.md) | [Async rate limiting](../framework/preact/guides/async-rate-limiting.md) |
| [Queuing](../framework/preact/guides/queuing.md) | [Async queuing](../framework/preact/guides/async-queuing.md) |
| [Batching](../framework/preact/guides/batching.md) | [Async batching](../framework/preact/guides/async-batching.md) |

The async utilities use `AsyncRetryer` internally for retry and abort support. See the [Async Retrying Guide](../framework/preact/guides/async-retrying.md).

# Solid

| Synchronous | Asynchronous |
| --- | --- |
| [Debouncing](../framework/solid/guides/debouncing.md) | [Async debouncing](../framework/solid/guides/async-debouncing.md) |
| [Throttling](../framework/solid/guides/throttling.md) | [Async throttling](../framework/solid/guides/async-throttling.md) |
| [Rate limiting](../framework/solid/guides/rate-limiting.md) | [Async rate limiting](../framework/solid/guides/async-rate-limiting.md) |
| [Queuing](../framework/solid/guides/queuing.md) | [Async queuing](../framework/solid/guides/async-queuing.md) |
| [Batching](../framework/solid/guides/batching.md) | [Async batching](../framework/solid/guides/async-batching.md) |

The async utilities use `AsyncRetryer` internally for retry and abort support. See the [Async Retrying Guide](../framework/solid/guides/async-retrying.md).

# Angular

| Synchronous | Asynchronous |
| --- | --- |
| [Debouncing](../framework/angular/guides/debouncing.md) | [Async debouncing](../framework/angular/guides/async-debouncing.md) |
| [Throttling](../framework/angular/guides/throttling.md) | [Async throttling](../framework/angular/guides/async-throttling.md) |
| [Rate limiting](../framework/angular/guides/rate-limiting.md) | [Async rate limiting](../framework/angular/guides/async-rate-limiting.md) |
| [Queuing](../framework/angular/guides/queuing.md) | [Async queuing](../framework/angular/guides/async-queuing.md) |
| [Batching](../framework/angular/guides/batching.md) | [Async batching](../framework/angular/guides/async-batching.md) |

The async utilities use `AsyncRetryer` internally for retry and abort support. See the [Async Retrying Guide](../framework/angular/guides/async-retrying.md).

# Vue

| Synchronous | Asynchronous |
| --- | --- |
| [Debouncing](../framework/vue/guides/debouncing.md) | [Async debouncing](../framework/vue/guides/async-debouncing.md) |
| [Throttling](../framework/vue/guides/throttling.md) | [Async throttling](../framework/vue/guides/async-throttling.md) |
| [Rate limiting](../framework/vue/guides/rate-limiting.md) | [Async rate limiting](../framework/vue/guides/async-rate-limiting.md) |
| [Queuing](../framework/vue/guides/queuing.md) | [Async queuing](../framework/vue/guides/async-queuing.md) |
| [Batching](../framework/vue/guides/batching.md) | [Async batching](../framework/vue/guides/async-batching.md) |

The async utilities use `AsyncRetryer` internally for retry and abort support. See the [Async Retrying Guide](../framework/vue/guides/async-retrying.md).

# Svelte

| Synchronous | Asynchronous |
| --- | --- |
| [Debouncing](../framework/svelte/guides/debouncing.md) | [Async debouncing](../framework/svelte/guides/async-debouncing.md) |
| [Throttling](../framework/svelte/guides/throttling.md) | [Async throttling](../framework/svelte/guides/async-throttling.md) |
| [Rate limiting](../framework/svelte/guides/rate-limiting.md) | [Async rate limiting](../framework/svelte/guides/async-rate-limiting.md) |
| [Queuing](../framework/svelte/guides/queuing.md) | [Async queuing](../framework/svelte/guides/async-queuing.md) |
| [Batching](../framework/svelte/guides/batching.md) | [Async batching](../framework/svelte/guides/async-batching.md) |

The async utilities use `AsyncRetryer` internally for retry and abort support. See the [Async Retrying Guide](../framework/svelte/guides/async-retrying.md).

# Lit

| Synchronous | Asynchronous |
| --- | --- |
| [Debouncing](../framework/lit/guides/debouncing.md) | [Async debouncing](../framework/lit/guides/async-debouncing.md) |
| [Throttling](../framework/lit/guides/throttling.md) | [Async throttling](../framework/lit/guides/async-throttling.md) |
| [Rate limiting](../framework/lit/guides/rate-limiting.md) | [Async rate limiting](../framework/lit/guides/async-rate-limiting.md) |
| [Queuing](../framework/lit/guides/queuing.md) | [Async queuing](../framework/lit/guides/async-queuing.md) |
| [Batching](../framework/lit/guides/batching.md) | [Async batching](../framework/lit/guides/async-batching.md) |

The async utilities use `AsyncRetryer` internally for retry and abort support. See the [Async Retrying Guide](../framework/lit/guides/async-retrying.md).

# Alpine

| Synchronous | Asynchronous |
| --- | --- |
| [Debouncing](../framework/alpine/guides/debouncing.md) | [Async debouncing](../framework/alpine/guides/async-debouncing.md) |
| [Throttling](../framework/alpine/guides/throttling.md) | [Async throttling](../framework/alpine/guides/async-throttling.md) |
| [Rate limiting](../framework/alpine/guides/rate-limiting.md) | [Async rate limiting](../framework/alpine/guides/async-rate-limiting.md) |
| [Queuing](../framework/alpine/guides/queuing.md) | [Async queuing](../framework/alpine/guides/async-queuing.md) |
| [Batching](../framework/alpine/guides/batching.md) | [Async batching](../framework/alpine/guides/async-batching.md) |

The async utilities use `AsyncRetryer` internally for retry and abort support. See the [Async Retrying Guide](../framework/alpine/guides/async-retrying.md).

# Ember

| Synchronous | Asynchronous |
| --- | --- |
| [Debouncing](../framework/ember/guides/debouncing.md) | [Async debouncing](../framework/ember/guides/async-debouncing.md) |
| [Throttling](../framework/ember/guides/throttling.md) | [Async throttling](../framework/ember/guides/async-throttling.md) |
| [Rate limiting](../framework/ember/guides/rate-limiting.md) | [Async rate limiting](../framework/ember/guides/async-rate-limiting.md) |
| [Queuing](../framework/ember/guides/queuing.md) | [Async queuing](../framework/ember/guides/async-queuing.md) |
| [Batching](../framework/ember/guides/batching.md) | [Async batching](../framework/ember/guides/async-batching.md) |

The async utilities use `AsyncRetryer` internally for retry and abort support. See the [Async Retrying Guide](../framework/ember/guides/async-retrying.md).

# Octane

| Synchronous | Asynchronous |
| --- | --- |
| [Debouncing](../framework/octane/guides/debouncing.md) | [Async debouncing](../framework/octane/guides/async-debouncing.md) |
| [Throttling](../framework/octane/guides/throttling.md) | [Async throttling](../framework/octane/guides/async-throttling.md) |
| [Rate limiting](../framework/octane/guides/rate-limiting.md) | [Async rate limiting](../framework/octane/guides/async-rate-limiting.md) |
| [Queuing](../framework/octane/guides/queuing.md) | [Async queuing](../framework/octane/guides/async-queuing.md) |
| [Batching](../framework/octane/guides/batching.md) | [Async batching](../framework/octane/guides/async-batching.md) |

The async utilities use `AsyncRetryer` internally for retry and abort support. See the [Async Retrying Guide](../framework/octane/guides/async-retrying.md).

# Vanilla

| Synchronous | Asynchronous |
| --- | --- |
| [Debouncing](../framework/vanilla/guides/debouncing.md) | [Async debouncing](../framework/vanilla/guides/async-debouncing.md) |
| [Throttling](../framework/vanilla/guides/throttling.md) | [Async throttling](../framework/vanilla/guides/async-throttling.md) |
| [Rate limiting](../framework/vanilla/guides/rate-limiting.md) | [Async rate limiting](../framework/vanilla/guides/async-rate-limiting.md) |
| [Queuing](../framework/vanilla/guides/queuing.md) | [Async queuing](../framework/vanilla/guides/async-queuing.md) |
| [Batching](../framework/vanilla/guides/batching.md) | [Async batching](../framework/vanilla/guides/async-batching.md) |

The async utilities use `AsyncRetryer` internally for retry and abort support. See the [Async Retrying Guide](../framework/vanilla/guides/async-retrying.md).

<!-- ::end:framework -->

## Core package or framework adapter

Use `@tanstack/pacer` when you need the core classes and functions without component lifecycle integration. The [Vanilla quick start](../framework/vanilla/quick-start.md) covers it.

Use a framework adapter in an application that needs automatic cleanup and reactive state. Each adapter has a quick start:

- [React](../framework/react/quick-start.md)
- [Preact](../framework/preact/quick-start.md)
- [Solid](../framework/solid/quick-start.md)
- [Angular](../framework/angular/quick-start.md)
- [Vue](../framework/vue/quick-start.md)
- [Svelte](../framework/svelte/quick-start.md)
- [Lit](../framework/lit/quick-start.md)
- [Alpine](../framework/alpine/quick-start.md)
- [Ember](../framework/ember/quick-start.md)
- [Octane](../framework/octane/quick-start.md)

Framework adapters provide several API shapes around the same underlying utility:

- Instance APIs such as `useDebouncer` expose lifecycle methods and selected state.
- Callback APIs such as `useDebouncedCallback` return a function to call.
- State and value APIs connect the utility to framework state.

Choose the narrowest API that provides the control you need. Use the instance API when you need methods such as `cancel()` or `flush()`.

## Pacer Lite or Pacer

`@tanstack/pacer-lite` is intended for libraries that need smaller, non-reactive utilities. It omits TanStack Store integration, framework adapters, Devtools support, and some advanced options.

Use the regular core package or a framework adapter for application code. Consider Pacer Lite when bundle size is the primary constraint and reactive state is unnecessary.
