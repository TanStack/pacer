<div align="center">
  <img src="./media/header_pacer.png" >
</div>

<br />

<div align="center">
	<a href="https://www.npmjs.com/package/@tanstack/pacer" target="\_parent">
	  <img alt="" src="https://img.shields.io/npm/dm/@tanstack/pacer.svg" alt="npm downloads" />
	</a>
- <a href="https://github.com/TanStack/pacer" target="\_parent">
	  <img alt="" src="https://img.shields.io/github/stars/TanStack/pacer.svg?style=social&label=Star" alt="GitHub stars" />
	</a>
	<a href="https://bundlephobia.com/result?p=@tanstack/react-pacer@latest" target="\_parent">
  <img alt="" src="https://badgen.net/bundlephobia/minzip/@tanstack/react-pacer@latest" alt="Bundle size" />
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

# TanStack Pacer (Fork with `maxWait`)

> **This is a fork of [TanStack Pacer](https://github.com/TanStack/pacer)** that adds a `maxWait` option to the debouncer. The TanStack team has decided not to include `maxWait` in the official library. This fork exists for anyone who needs that capability.

A lightweight timing and scheduling library for debouncing, throttling, rate limiting, queuing, and batching.

## Why `maxWait`?

Standard debouncing delays execution until a burst of activity stops. This works well most of the time, but it has a fundamental problem: **if calls never stop, execution never happens.** A user typing continuously, a stream of scroll events, or a sensor firing rapid updates can all postpone the debounced function indefinitely.

The `maxWait` option sets an upper bound on how long execution can be deferred. Once that limit is reached, the function fires with the most recent arguments regardless of ongoing activity. The regular debounce timer then resets, and the cycle continues.

This is the same behavior provided by lodash's `_.debounce(fn, wait, { maxWait })`, which has been a widely relied-upon pattern for years.

### Why not just use throttle?

TanStack Pacer already includes a throttler, and at first glance `debounce + maxWait` looks similar to throttling. Both guarantee execution during continuous activity. The difference is in _how_ they schedule that execution, and it matters in practice.

**Throttle** fires on a fixed cadence. With `{ wait: 1000 }`, you get an execution every ~1000ms no matter what -- even if the user paused at 200ms and is waiting for a response. Throttle doesn't know or care that activity stopped; it sticks to its schedule.

**Debounce + maxWait** is adaptive. With `{ wait: 300, maxWait: 1000 }`, if the user pauses for 300ms the function fires immediately after the pause -- you don't wait for the next 1000ms tick. But if the user never pauses, you still get execution at least every 1000ms. You get **low latency when possible, bounded latency when necessary.**

Concretely, consider a search input where the user types "react" with natural pauses:

| Time   | Event           | Throttle (1000ms)        | Debounce (300ms wait, 1000ms maxWait)                |
| ------ | --------------- | ------------------------ | ---------------------------------------------------- |
| 0ms    | types "r"       | fires "r" (leading)      | waits...                                             |
| 150ms  | types "re"      | queued                   | waits...                                             |
| 300ms  | types "rea"     | queued                   | waits...                                             |
| 700ms  | pauses to think | --                       | fires "rea" at 1000ms (300ms after pause)            |
| 1000ms | --              | fires "rea" (trailing)   | --                                                   |
| 1200ms | types "reac"    | fires "reac" (leading)   | waits...                                             |
| 1400ms | types "react"   | queued                   | waits...                                             |
| 1700ms | done typing     | --                       | fires "react" at 1700ms (300ms after last keystroke) |
| 2200ms | --              | fires "react" (trailing) | --                                                   |

The throttle version fires 4 times and has up to 800ms of wasted latency (the user stopped at 700ms but results don't arrive until the trailing edge at 1000ms). The debounce+maxWait version fires 2 times and responds within 300ms of each pause.

The two tools solve different problems:

- **Throttle** is for smoothing high-frequency events into a steady pulse -- scroll handlers, mousemove tracking, progress updates. You want consistent, evenly-spaced execution.
- **Debounce + maxWait** is for collapsing bursts while bounding worst-case latency -- search inputs, autosave, form validation. You want to wait for the user to finish, but not forever.

### Use cases

- **Search-as-you-type** -- Show results within a guaranteed window even if the user types without pausing, so the UI never feels unresponsive.
- **Autosave** -- Debounce keystrokes to avoid saving on every character, but guarantee a save at least every N seconds so work is never lost.
- **Live previews and validation** -- Update a rendered preview or run validation periodically during continuous editing so the user gets timely feedback.
- **Scroll / resize handlers** -- Debounce expensive layout recalculations while still recalculating at regular intervals during a long, continuous scroll.
- **Analytics and telemetry** -- Batch rapid user interactions but flush them periodically so dashboards stay reasonably up-to-date.

### How to use it

`maxWait` is available on every debounce API in the library -- the core `Debouncer` / `AsyncDebouncer` classes, the `debounce` / `asyncDebounce` helper functions, and all framework hooks (`useDebouncer`, `useDebouncedCallback`, `useDebouncedState`, `useDebouncedValue`).

```tsx
import { useDebouncedCallback } from '@tanstack/react-pacer'

function SearchInput() {
  const handleSearch = useDebouncedCallback(
    (query: string) => fetchResults(query),
    {
      wait: 300, // wait 300ms after the user stops typing
      maxWait: 1000, // but always search at least once per second
    },
  )

  return <input onChange={(e) => handleSearch(e.target.value)} />
}
```

`maxWait` also accepts a function for dynamic values:

```ts
const debouncer = new Debouncer(save, {
  wait: 500,
  maxWait: (d) => (d.store.state.executionCount === 0 ? 500 : 2000),
})
```

### Behavior details

- The `maxWait` timer starts when the first call in a burst arrives and does not reset on subsequent calls.
- When `maxWait` fires, it uses the **most recent arguments**, not the arguments from the first call.
- If the normal debounce wait expires before `maxWait`, the function fires normally and the `maxWait` timer is cleared.
- `cancel()`, `flush()`, and `setOptions({ enabled: false })` all clear the `maxWait` timer.
- `maxWait` works correctly with `leading`, `trailing`, and all other debouncer options.
- Setting `maxWait` less than `wait` effectively caps the maximum delay, so the function fires at most every `maxWait` milliseconds during continuous calls.

---

> [!NOTE]
> TanStack Pacer is currently mostly a client-side only library, but it is being designed to be able to potentially be used on the server-side as well.

- **Debouncing**
  - Delay execution until after a period of inactivity for when you only care about the last execution in a sequence.
  - Optional `maxWait` to guarantee periodic execution during continuous calls
  - Synchronous or Asynchronous Debounce utilities with promise support and error handling
  - Control of leading, trailing, and enabled options
- **Throttling**
  - Smoothly limit the rate at which a function can fire
  - Synchronous or Asynchronous Throttle utilities with promise support and error handling
  - Control of leading, trailing, and enabled options.
- **Rate Limiting**
  - Limit the rate at which a function can fire over a period of time
  - Synchronous or Asynchronous Rate Limiting utilities with promise support and error handling
  - Fixed or Sliding Window variations of Rate Limiting
- **Queuing**
  - Queue functions to be executed in a specific order
  - Choose from FIFO, LIFO, and Priority queue implementations
  - Control processing speed with configurable wait times or concurrency limits
  - Manage queue execution with start/stop capabilities
  - Expire items from the queue after a configurable duration
- **Batching**
  - Chunk up multiple operations into larger batches to reduce total back-and-forth operations
  - Batch by time period, batch size, whichever comes first, or a custom condition to trigger batch executions
- **Async or Sync Variations**
  - Choose between synchronous and asynchronous versions of each utility
  - Optional error, success, and settled handling for async variations
  - Retry and Abort support for async variations
- **State Management**
  - Uses TanStack Store under the hood for state management with fine-grained reactivity
  - Easily integrate with your own state management library of choice
  - Persist state to local or session storage for some utilities like rate limiting and queuing
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

### <a href="https://tanstack.com/pacer">Upstream docs</a>

<br />

> [!NOTE]
> You may know **TanStack Pacer** by our adapter names, too!
>
> - [**React Pacer**](https://tanstack.com/pacer/latest/docs/framework/react/react-pacer)
> - [**Preact Pacer**](https://tanstack.com/pacer/latest/docs/framework/preact/preact-pacer)
> - [**Solid Pacer**](https://tanstack.com/pacer/latest/docs/framework/solid/solid-pacer)
> - [**Angular Pacer**](https://tanstack.com/pacer/latest/docs/framework/angular/angular-pacer)
> - Svelte Pacer - needs a contributor!
> - Vue Pacer - needs a contributor!

## Get Involved

- We welcome issues and pull requests!
- Participate in [GitHub discussions](https://github.com/TanStack/pacer/discussions)
- Chat with the community on [Discord](https://discord.com/invite/WrRKjPJ)
- See [CONTRIBUTING.md](./CONTRIBUTING.md) for setup instructions

## Partners

<table align="center">
  <tr>
    <td>
      <a href="https://www.coderabbit.ai/?via=tanstack&dub_id=aCcEEdAOqqutX6OS" >
        <picture>
          <source media="(prefers-color-scheme: dark)" srcset="https://tanstack.com/assets/coderabbit-dark-CMcuvjEy.svg" height="40" />
          <source media="(prefers-color-scheme: light)" srcset="https://tanstack.com/assets/coderabbit-light-DVMJ2jHi.svg" height="40" />
          <img src="https://tanstack.com/assets/coderabbit-light-DVMJ2jHi.svg" height="40" alt="CodeRabbit" />
        </picture>
      </a>
    </td>
    <td>
      <a href="https://www.cloudflare.com?utm_source=tanstack">
        <picture>
          <source media="(prefers-color-scheme: dark)" srcset="https://tanstack.com/assets/cloudflare-white-DQDB7UaL.svg" height="60" />
          <source media="(prefers-color-scheme: light)" srcset="https://tanstack.com/assets/cloudflare-black-CPufaW0B.svg" height="60" />
          <img src="https://tanstack.com/assets/cloudflare-black-CPufaW0B.svg" height="60" alt="Cloudflare" />
        </picture>
      </a>
    </td>
    <td>
      <a href="https://www.unkey.com/?utm_source=tanstack">
        <picture>
          <source media="(prefers-color-scheme: dark)" srcset="./media/unkey_dark.svg" height="60" />
          <source media="(prefers-color-scheme: light)" srcset="./media/unkey_logo.svg" height="60" />
          <img src="./media/unkey_logo.svg" height="60" alt="Unkey"/>
        </picture>
      </a>
    </td>
  </tr>
</table>

<div align="center">
<img src="./media/partner_logo.svg" alt="Pacer & you?" height="65">
<p>
We're looking for TanStack Pacer Partners to join our mission! Partner with us to push the boundaries of TanStack Pacer and build amazing things together.
</p>
<a href="mailto:partners@tanstack.com?subject=TanStack Pacer Partnership"><b>LET'S CHAT</b></a>
</div>

</div>

## Explore the TanStack Ecosystem

- <a href="https://github.com/tanstack/config"><b>TanStack Config</b></a> – Tooling for JS/TS packages
- <a href="https://github.com/tanstack/db"><b>TanStack DB</b></a> – Reactive sync client store
- <a href="https://github.com/tanstack/devtools"><b>TanStack DevTools</b></a> – Unified devtools panel
- <a href="https://github.com/tanstack/form"><b>TanStack Form</b></a> – Type‑safe form state
- <a href="https://github.com/tanstack/query"><b>TanStack Query</b></a> – Async state & caching
- <a href="https://github.com/tanstack/ranger"><b>TanStack Ranger</b></a> – Range & slider primitives
- <a href="https://github.com/tanstack/router"><b>TanStack Router</b></a> – Type‑safe routing, caching & URL state
- <a href="https://github.com/tanstack/router"><b>TanStack Start</b></a> – Full‑stack SSR & streaming
- <a href="https://github.com/tanstack/store"><b>TanStack Store</b></a> – Reactive data store
- <a href="https://github.com/tanstack/table"><b>TanStack Table</b></a> – Headless datagrids
- <a href="https://github.com/tanstack/virtual"><b>TanStack Virtual</b></a> – Virtualized rendering

… and more at <a href="https://tanstack.com"><b>TanStack.com »</b></a>

<!-- USE THE FORCE LUKE -->
