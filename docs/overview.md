---
title: Overview
id: overview
---

TanStack Pacer is a library of utilities for controlling when functions run: debouncing, throttling, rate limiting, queuing, and batching. Plenty of libraries ship a `debounce` helper. We built Pacer because we kept needing the details those one-liners skip: full type safety, tree-shaking, cancellation, pending state you can render, and one consistent API across all five patterns and every framework adapter. Execution timing is usually an afterthought until a race condition or a hammered API forces the issue. Pacer's job is to make the correct pattern the easy one to reach for.

> [!IMPORTANT]
> TanStack Pacer is currently in **beta** and its API is still subject to change.
>
> The scope of this library may grow, but we hope to keep the bundle size of each individual utility lean and focused.

## Origin

Many of the ideas (and code) for TanStack Pacer are not new. In fact, many of these utilities have been living in other TanStack libraries for quite some time. We extracted code from TanStack Query, Router, Form, and even Tanner's original [Swimmer](https://github.com/tannerlinsley/swimmer) library. Then we cleaned up these utilities, filled in some gaps, and shipped them as a standalone library.

## Features

> [!NOTE]
> TanStack Pacer is mostly a client-side library today, but we are designing the core so it can work on the server as well.

- **Debouncing**
  - Wait until calls stop, then run the latest one
  - Sync and async variations with promise support and error handling
  - Leading, trailing, and enabled options
- **Throttling**
  - Limit how often a function fires, with evenly spaced executions
  - Sync and async variations with promise support and error handling
  - Leading, trailing, and enabled options
- **Rate Limiting**
  - Cap how many times a function fires within a time window
  - Sync and async variations with promise support and error handling
  - Fixed or sliding window behavior
- **Queuing**
  - Run every call, in order, without losing any
  - FIFO, LIFO, and priority ordering
  - Configurable wait times and concurrency limits
  - Start, stop, and item expiration controls
- **Batching**
  - Collect items and process them together in one call
  - Trigger a batch by size, time, whichever comes first, or a custom condition
- **Async Support**
  - Every utility has an async version that awaits results
  - Optional error, success, and settled callbacks
  - Retry and abort support
- **State Management**
  - TanStack Store under the hood, with fine-grained reactivity
  - Works alongside whatever state management you already use
  - Some utilities, like rate limiting and queuing, can persist state to local or session storage
- **Convenient Hooks**
  - Pre-built hooks like `useDebouncedCallback`, `useThrottledValue`, and `useQueuedState` cut down on boilerplate
  - Several layers of abstraction, from a bare callback to a full instance API
- **Type Safety**
  - Your functions are always called with the correct argument types
  - Generic utilities that adapt to your own types
- **Framework Adapters**
  - React, Preact, Solid, and Angular
- **Tree Shaking**
  - Tree-shaking works by default, and each utility also has its own deep import, so a library can pull in one utility without inflating its bundle-phobia report

## Interactive comparison demo

The fastest way to understand the five utilities is to watch them handle the same input. Move the range slider and compare how debouncing, throttling, rate limiting, queuing, and batching each respond:

<iframe src="https://stackblitz.com/github/TanStack/pacer/tree/main/examples/react/util-comparison?embed=1&view=preview&hideNavigation=1" width="100%" height="1200px" style="border: 1px solid #ccc; border-radius: 4px;"></iframe>

## Pacer Lite

Pacer Lite (`@tanstack/pacer-lite`) is a stripped-down version of the core library, meant for npm packages that want minimal overhead. Each Lite utility behaves the same as its full counterpart but drops reactivity, framework adapters, devtools support, and some advanced options in exchange for a smaller bundle. If you are building an application, use the regular packages. Reach for Lite when you are publishing a library and every kilobyte counts.