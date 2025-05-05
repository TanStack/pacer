![TanStack Pacer Header](https://github.com/tanstack/pacer/raw/main/media/repo-header.png)

# [TanStack](https://tanstack.com) Pacer v0

Utilities for debouncing, throttling, rate limiting, queuing, and more.

<a href="https://twitter.com/intent/tweet?button_hashtag=TanStack" target="\_parent">
  <img alt="#TanStack" src="https://img.shields.io/twitter/url?color=%2308a0e9&label=%23TanStack&style=social&url=https%3A%2F%2Ftwitter.com%2Fintent%2Ftweet%3Fbutton_hashtag%3DTanStack" />
</a>
<a href="https://github.com/tanstack/pacer/actions?pacer=workflow%3A%22react-pacer+tests%22">
  <img src="https://github.com/tanstack/pacer/workflows/react-pacer%20tests/badge.svg" />
</a>
<a href="https://npmjs.com/package/@tanstack/react-pacer" target="\_parent">
  <img alt="" src="https://img.shields.io/npm/dm/@tanstack/react-pacer.svg" />
</a>
<a href="https://bundlephobia.com/result?p=@tanstack/react-pacer@latest" target="\_parent">
  <img alt="" src="https://badgen.net/bundlephobia/minzip/@tanstack/react-pacer@latest" />
</a>
<a href="#badge">
  <img alt="semantic-release" src="https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg">
</a>
<a href="https://github.com/tanstack/pacer/discussions">
  <img alt="Join the discussion on Github" src="https://img.shields.io/badge/Github%20Discussions%20%26%20Support-Chat%20now!-blue" />
</a>
<a href="https://github.com/tanstack/pacer" target="\_parent">
  <img alt="" src="https://img.shields.io/github/stars/tanstack/react-pacer.svg?style=social&label=Star" />
</a>
<a href="https://twitter.com/tannerlinsley" target="\_parent">
  <img alt="" src="https://img.shields.io/twitter/follow/tannerlinsley.svg?style=social&label=Follow" />
</a>

## Enjoy this library?

Try other [TanStack](https://tanstack.com) libraries:

- [TanStack Router](https://github.com/TanStack/router) <img alt="" src="https://img.shields.io/github/stars/tanstack/router.svg" />
- [TanStack Query](https://github.com/TanStack/query) <img alt="" src="https://img.shields.io/github/stars/tanstack/query.svg" />
- [TanSack Table](https://github.com/TanStack/table) <img alt="" src="https://img.shields.io/github/stars/tanstack/table.svg" />
- [TanStack Virtual](https://github.com/TanStack/virtual) <img alt="" src="https://img.shields.io/github/stars/tanstack/virtual.svg" />
- [TanStack Form](https://github.com/TanStack/form) <img alt="" src="https://img.shields.io/github/stars/tanstack/form.svg" />
- [TanStack Store](https://github.com/TanStack/store) <img alt="" src="https://img.shields.io/github/stars/tanstack/store.svg" />
- [TanStack Ranger](https://github.com/TanStack/ranger) <img alt="" src="https://img.shields.io/github/stars/tanstack/ranger.svg" />
- [TanStack Pacer](https://github.com/TanStack/pacer) <img alt="" src="https://img.shields.io/github/stars/tanstack/pacer.svg" />
- [TanStack Config](https://github.com/TanStack/config) <img alt="" src="https://img.shields.io/github/stars/tanstack/config.svg" />

## Visit [tanstack.com/pacer](https://tanstack.com/pacer) for docs, guides, API and more!

You may know **TanSack Pacer** by our adapter names, too!

- [**React Pacer**](https://tanstack.com/pacer/latest/docs/framework/react/react-pacer)

## Summary

Take control of your application's timing with TanStack Pacer's rate limiting, throttling, and debouncing utilities. Manage complex async workflows using intelligent queuing and concurrency controls while maintaining full control with built-in pause, resume, and cancel capabilities.

## Quick Features

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
  - Control processing with configurable wait times or concurrency limits
  - Manage queue execution with start/stop capabilities
  - Synchronous or Asynchronous Queue utilities with promise support and success, settled, and error, handling
- **Comparison Utilities**
  - Perform deep equality checks between values
  - Create custom comparison logic for specific needs
- **Convenient Hooks**
  - Reduce boilerplate code with pre-built hooks like `useDebouncedCallback`, `useThrottledValue`, and `useQueuedState`, and more.
- **Type Safety**
  - Full type safety with TypeScript that makes sure that your functions will always be called with the correct arguments
  - Generics for flexible and reusable utilities
- **Framework Adapters**
  - React, Solid, and more
- **Tree Shaking**
  - We, of course, get tree-shaking right for your applications by default, but we also provide extra deep imports for each utility, making it easier to embed these utilities into your libraries without increasing the bundle-phobia reports of your library.

## Installation

Install one of the following packages based on your framework of choice:

```bash
# Npm
npm install @tanstack/react-pacer
npm install @tanstack/pacer # no framework, just vanilla js
```

## How to help?

### [Become a Sponsor](https://github.com/sponsors/tannerlinsley/)

<!-- USE THE FORCE LUKE -->
