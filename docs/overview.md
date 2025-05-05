---
title: Overview
id: overview
---

TanStack Pacer is a library focused on providing high-quality utilities for controlling function execution timing in your applications. While similar utilities exist elsewhere, we aim to get all the important details right - including ***type-safety***, ***tree-shaking***, and a consistent and ***intuitive API***. By focusing on these fundamentals and making them available in a ***framework agnostic*** way, we hope to make these utilities and patterns more commonplace in your applications. Proper execution control is often an afterthought in application development, leading to performance issues, race conditions, and poor user experiences that could have been prevented. TanStack Pacer helps you implement these critical patterns correctly from the start!

> [!IMPORTANT]
> TanStack Pacer is currently in **alpha** and its API is subject to change.
>
> The scope of this library may grow, but we hope to keep the bundle size of each individual utility lean and focused.

## Origin

Many of the ideas (and code) for TanStack Pacer are not new. In fact, many of these utilities have been living in other TanStack libraries for quite some time. We extracted code from TanStack Query, Router, Form, and even Tanner's original [Swimmer](https://github.com/tannerlinsley/swimmer) library. Then we cleaned up these utilities, filled in some gaps, and shipped them as a standalone library.

## Key Features

- **Debouncing**
  - Delay functions execution until after a period of inactivity
  - Synchronous or Asynchronous Debounce utilities with promise support and error handling
- **Throttling**
  - Limit the rate at which a function can fire
  - Synchronous or Asynchronous Throttle utilities with promise support and error handling
- **Rate Limiting**
  - Limit the rate at which a function can fire
  - Synchronous or Asynchronous Rate Limiting utilities with promise support and error handling
- **Queuing**
  - Queue functions to be executed in a specific order
  - Choose from FIFO, LIFO, and Priority queue implementations
  - Control processing speed with configurable wait times or concurrency limits
  - Manage queue execution with start/stop capabilities
  - Expire items from the queue after a configurable duration
- **Async or Sync Variations**
  - Choose between synchronous and asynchronous versions of each utility
  - Enforce single-flight execution of functions if needed in the async variations of the utilities
  - Optional error, success, and settled handling for async variations
- **Comparison Utilities**
  - Perform deep equality checks between values
  - Create custom comparison logic for specific needs
- **Convenient Hooks**
  - Reduce boilerplate code with pre-built hooks like `useDebouncedCallback`, `useThrottledValue`, and `useQueuedState`, and more.
  - Multiple layers of abstraction to choose from depending on your use case.
  - Works with each framework's default state management solutions, or with whatever custom state management library that you prefer.
- **Type Safety**
  - Full type safety with TypeScript that makes sure that your functions will always be called with the correct arguments
  - Generics for flexible and reusable utilities
- **Framework Adapters**
  - React, Solid, and more
- **Tree Shaking**
  - We, of course, get tree-shaking right for your applications by default, but we also provide extra deep imports for each utility, making it easier to embed these utilities into your libraries without increasing the bundle-phobia reports of your library.
