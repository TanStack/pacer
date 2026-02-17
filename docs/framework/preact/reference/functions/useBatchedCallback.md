---
id: useBatchedCallback
title: useBatchedCallback
---

# Function: useBatchedCallback()

```ts
function useBatchedCallback<TFn>(fn, options): (...args) => void;
```

Defined in: [preact-pacer/src/batcher/useBatchedCallback.ts:41](https://github.com/TanStack/pacer/blob/main/packages/preact-pacer/src/batcher/useBatchedCallback.ts#L41)

A Preact hook that creates a batched version of a callback function.
This hook is essentially a wrapper around the basic `batch` function
that is exported from `@tanstack/pacer`,
but optimized for Preact with reactive options and a stable function reference.

The batched function will collect individual calls into batches and execute them
when batch conditions are met (max size reached, wait time elapsed, or custom logic).

This hook provides a simpler API compared to `useBatcher`, making it ideal for basic
batching needs. However, it does not expose the underlying Batcher instance.

For advanced usage requiring features like:
- Manual batch execution
- Access to batch state and metrics
- Custom useCallback dependencies

Consider using the `useBatcher` hook instead.

## Type Parameters

### TFn

`TFn` *extends* `AnyFunction`

## Parameters

### fn

(`items`) => `void`

### options

[`PreactBatcherOptions`](../interfaces/PreactBatcherOptions.md)\<`Parameters`\<`TFn`\>\[`0`\], \{
\}\>

## Returns

```ts
(...args): void;
```

### Parameters

#### args

...`Parameters`\<`TFn`\>

### Returns

`void`

## Example

```tsx
// Batch analytics events
const trackEvents = useBatchedCallback((events: AnalyticsEvent[]) => {
  sendAnalytics(events);
}, {
  maxSize: 5,    // Process when 5 events collected
  wait: 2000     // Or after 2 seconds
});

// Use in event handlers
<button onClick={() => trackEvents({ type: 'click', target: 'button' })}>
  Click me
</button>
```
