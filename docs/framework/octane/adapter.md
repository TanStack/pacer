---
title: Octane Adapter
id: adapter
---

The `octane-pacer` adapter connects Pacer scheduling utilities to Octane state and lifecycle management. It re-exports the core package, including utility classes, stateless functions, option types, and async retrying.

## Installation

```sh
pnpm add @tanstack/octane-pacer
```

Octane requires Node.js 22.22.2 or newer and Octane 0.1.36.

## Lifecycle and state

Call hooks at the top level of a compiled Octane component. The compiler assigns each call its own hook slot. The hook retains its utility across renders and commits the current callback and options in a layout effect. Selected state triggers rendering, and unmounting cleans up the utility. Use Octane 0.1.36; this package does not support the 0.2 line yet.

By default, the selected state is `{}`. Pass a selector to subscribe only to the fields your UI reads. The underlying `store` remains available for additional subscriptions.

## API overview

| Utility | Instance API | Convenience APIs |
| --- | --- | --- |
| [batching](./guides/batching.md) | `useBatcher` | `useBatchedCallback` |
| [debouncing](./guides/debouncing.md) | `useDebouncer` | `useDebouncedCallback`, `useDebouncedState`, `useDebouncedValue` |
| [queuing](./guides/queuing.md) | `useQueuer` | `useQueuedState`, `useQueuedValue` |
| [rate limiting](./guides/rate-limiting.md) | `useRateLimiter` | `useRateLimitedCallback`, `useRateLimitedState`, `useRateLimitedValue` |
| [throttling](./guides/throttling.md) | `useThrottler` | `useThrottledCallback`, `useThrottledState`, `useThrottledValue` |
| [async batching](./guides/async-batching.md) | `useAsyncBatcher` | `useAsyncBatchedCallback` |
| [async debouncing](./guides/async-debouncing.md) | `useAsyncDebouncer` | `useAsyncDebouncedCallback` |
| [async queuing](./guides/async-queuing.md) | `useAsyncQueuer` | `useAsyncQueuedState` |
| [async rate limiting](./guides/async-rate-limiting.md) | `useAsyncRateLimiter` | `useAsyncRateLimitedCallback` |
| [async throttling](./guides/async-throttling.md) | `useAsyncThrottler` | `useAsyncThrottledCallback` |

## Example

```tsx
import { createRoot, useState } from 'octane';
import { useDebouncer } from '@tanstack/octane-pacer';
function Example() @{
  const [input, setInput] = useState('hello');
  const [wait, setWait] = useState(200);
  const [history, setHistory] = useState<Array<string>>([]);
  const utility = useDebouncer((value: string) => { setHistory((previous) => [...previous, value]); }, { wait: wait }, (state) => state);
  <main>
<h1>Octane useDebouncer</h1><p>Wait until typing stops, then execute the latest call.</p>
<label>Task <input value={input} onInput={(event) => setInput(event.currentTarget.value)} /></label><label>Wait (ms) <input value={wait} onInput={(event) => setWait(Number(event.currentTarget.value))} type="number" min="0" /></label>
<div><button onClick={() => { void utility.maybeExecute(input); }}>Schedule</button><button onClick={() => { for (let i = 1; i <= 3; i++) void utility.maybeExecute(`${input} ${i}`); }}>Schedule three</button><button onClick={() => { void utility.flush(); }}>Flush</button><button onClick={() => { utility.cancel(); }}>Cancel</button><button onClick={() => setHistory([])}>Clear history</button></div>
<section><h2>Processed results</h2><pre data-testid="history">{JSON.stringify(history, null, 2)}</pre></section>
<section><h2>Utility state</h2><pre>{JSON.stringify(utility.state, null, 2)}</pre></section>
<p class="caption">The hook retains one utility across renders and commits current options and callbacks.</p>
</main>
}
createRoot(document.getElementById('app')!).render(Example);
```

## Reactive options

Pass a plain options object, property getters, or an options factory. The adapter evaluates top-level getters, while function-valued core options remain callbacks. Options update the existing utility; pending work, counters, and the store retain their identity.

Options retain the core partial-merge behavior. Omitting a key preserves the previous setting; explicitly passing `undefined` clears it. `key`, `initialState`, and `initialItems` initialize the utility once and do not recreate it on later updates.

## Default options

Wrap descendants in `PacerProvider` with `defaultOptions`. Group defaults by utility, such as `{ debouncer: { leading: true } }`. Local options take precedence and provider changes apply after commit.

## Cleanup

Debouncers, throttlers, and batchers cancel pending timers by default. Queuers stop processing. Async variants also abort active work. Synchronous rate limiters need no timer cleanup.

Set `onUnmount` to replace the default cleanup, for example to call `flush()` before leaving a page. The callback receives the adapter instance and its selected state. If you replace cleanup for an async utility, call its cancellation or abort methods when needed.

## Callback and value helpers

Callback helpers return only the scheduled function. Use an instance API when you need `flush`, `cancel`, queue controls, or state subscriptions.

State helpers return `[value, setValue, utility]`; value helpers return `[value, utility]`. Setters accept a new value or a functional update. Queue state helpers return `[items, utility]`.

## Async utilities

The five async utilities preserve typed results and core error behavior. Use `onSuccess`, `onError`, and `onSettled` for outcomes, and `asyncRetryerOptions` for retry configuration. `abort()` is cooperative: your operation must observe the supplied abort signal. See the individual async guides for scheduling and concurrency details.

## Devtools

The utilities emit the same Pacer devtools events as the other adapters. Use the framework-independent `@tanstack/pacer-devtools` panel when your application supplies a devtools host.

## API reference

See the [generated reference](./reference/index.md) for signatures, options, and return types.
