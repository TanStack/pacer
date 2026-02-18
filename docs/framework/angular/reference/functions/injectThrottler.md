---
id: injectThrottler
title: injectThrottler
---

# Function: injectThrottler()

```ts
function injectThrottler<TFn, TSelected>(
   fn, 
   options, 
selector): AngularThrottler<TFn, TSelected>;
```

Defined in: [throttler/injectThrottler.ts:109](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/throttler/injectThrottler.ts#L109)

An Angular function that creates and manages a Throttler instance.

This is a lower-level function that provides direct access to the Throttler's functionality.
This allows you to integrate it with any state management solution you prefer.

This function provides throttling functionality to limit how often a function can be called,
ensuring it executes at most once within a specified time window.

The throttler will execute the function immediately (if leading is enabled) and then
prevent further executions until the wait period has elapsed.

## State Management and Selector

The function uses TanStack Store for state management and wraps it with Angular signals.
The `selector` parameter allows you to specify which state changes will trigger signal updates,
optimizing performance by preventing unnecessary updates when irrelevant state changes occur.

**By default, there will be no reactive state subscriptions** and you must opt-in to state
tracking by providing a selector function. This prevents unnecessary updates and gives you
full control over when your component tracks state changes.

Available state properties:
- `canLeadingExecute`: Whether the throttler can execute on the leading edge
- `canTrailingExecute`: Whether the throttler can execute on the trailing edge
- `executionCount`: Number of function executions that have been completed
- `isPending`: Whether the throttler is waiting for the timeout to trigger execution
- `lastArgs`: The arguments from the most recent call to maybeExecute
- `lastExecutionTime`: Timestamp of the last execution
- `nextExecutionTime`: Timestamp of the next allowed execution
- `status`: Current execution status ('disabled' | 'idle' | 'pending')

## Cleanup on Destroy

By default, the function cancels any pending execution when the component is destroyed.
Use the `onUnmount` option to customize this. For example, to flush pending work instead:

```ts
const throttler = injectThrottler(fn, {
  wait: 100,
  onUnmount: (t) => t.flush()
});
```

## Type Parameters

### TFn

`TFn` *extends* `AnyFunction`

### TSelected

`TSelected` = \{
\}

## Parameters

### fn

`TFn`

### options

[`AngularThrottlerOptions`](../interfaces/AngularThrottlerOptions.md)\<`TFn`, `TSelected`\>

### selector

(`state`) => `TSelected`

## Returns

[`AngularThrottler`](../interfaces/AngularThrottler.md)\<`TFn`, `TSelected`\>

## Example

```ts
// Default behavior - no reactive state subscriptions
const throttler = injectThrottler(
  (scrollY: number) => updateScrollPosition(scrollY),
  { wait: 100 }
);

// Opt-in to track isPending changes (optimized for loading states)
const throttler = injectThrottler(
  (scrollY: number) => updateScrollPosition(scrollY),
  { wait: 100 },
  (state) => ({ isPending: state.isPending })
);

// In an event handler
window.addEventListener('scroll', () => {
  throttler.maybeExecute(window.scrollY);
});

// Access the selected state (will be empty object {} unless selector provided)
const { isPending } = throttler.state();
```
