---
title: Octane Async Rate Limiting Guide
id: async-rate-limiting
---

Async rate limiting keeps the window behavior described in the [Rate Limiting Guide](./rate-limiting.md), while adding Promise results, retries, error callbacks, and control over in-flight work.

Use it when accepted operations return values you need, can reject, or need retry and abort support. Use the synchronous limiter when you only need an immediate accepted-or-rejected boolean.

## Choose an API

- `useAsyncRateLimitedCallback` for a quota-controlled handler
- `useAsyncRateLimiter` for capacity helpers and selected execution state

## Use useAsyncRateLimiter

Call hooks at the top level of a compiled Octane component. The compiler assigns each call its own hook slot. The hook retains its utility across renders and commits the current callback and options in a layout effect. Selected state triggers rendering, and unmounting cleans up the utility. Use Octane 0.1.36; this package does not support the 0.2 line yet.

```tsx
import { createRoot, useState } from 'octane';
import { useAsyncRateLimiter } from '@tanstack/octane-pacer';
function Example() @{
  const [input, setInput] = useState('hello');
  const [wait, setWait] = useState(200);
  const [history, setHistory] = useState<Array<string>>([]);
  const utility = useAsyncRateLimiter(async (value: string) => { setHistory((previous) => [...previous, value]); }, { limit: 2, window: wait }, (state) => state);
  <main>
<h1>Octane useAsyncRateLimiter</h1><p>Accept up to two executions per time window and track rejected calls.</p>
<label>Task <input value={input} onInput={(event) => setInput(event.currentTarget.value)} /></label><label>Wait (ms) <input value={wait} onInput={(event) => setWait(Number(event.currentTarget.value))} type="number" min="0" /></label>
<div><button onClick={() => { void utility.maybeExecute(input); }}>Schedule</button><button onClick={() => { for (let i = 1; i <= 3; i++) void utility.maybeExecute(`${input} ${i}`); }}>Schedule three</button><button onClick={() => { void utility.reset(); }}>Reset window</button><button onClick={() => { utility.abort(); }}>Reset</button><button onClick={() => setHistory([])}>Clear history</button></div>
<section><h2>Processed results</h2><pre data-testid="history">{JSON.stringify(history, null, 2)}</pre></section>
<section><h2>Utility state</h2><pre>{JSON.stringify(utility.state, null, 2)}</pre></section>
<p class="caption">The hook retains one utility across renders and commits current options and callbacks.</p>
</main>
}
createRoot(document.getElementById('app')!).render(Example);
```

## Options and controls

`maybeExecute` accepts or rejects each call based on `limit` and `window`. Rejected calls are not queued for later. `reset()` clears the window and state. Function-valued limits can inspect the limiter at execution time. Select `settleCount` and `rejectionCount` to show accepted and rejected attempts.

The async variant awaits your callback. `onSuccess` receives the result, `onError` handles failures, and `onSettled` runs after an outcome. Configure `throwOnError` to decide whether a failed execution rejects its returned promise. `asyncRetryerOptions` configures retries inside the scheduled operation. Select `successCount`, `errorCount`, and `settleCount` where the utility exposes them.

`abort()` signals active work to stop. Pass the utility's abort signal to cancellable operations such as `fetch`. Cancellation is cooperative and cannot undo an operation that already completed.

## Reactive options and cleanup

Use an options factory or property getters to read reactive settings. Updating options preserves the utility and its pending work. An already scheduled timer keeps its current deadline unless you explicitly cancel or reschedule it.

The owning component supplies default cleanup. `onUnmount` replaces that behavior and receives the same adapter instance. To flush pending work, provide a callback that calls `flush()` where supported. For async work, also decide whether it should be aborted.

## State and convenience helpers

Pass a selector as the final argument to choose state fields. Without a selector, selected state is `{}`. Core methods and the raw store remain available regardless of your selection.

`useAsyncRateLimitedCallback` returns only the scheduled callback. Use it for event handlers that do not need access to state or control methods.

## Related documentation

- [Octane adapter](../adapter.md)
- [Core async rate limiting guide](../../../guides/async-rate-limiting.md)
- [API reference](../reference/index.md)
