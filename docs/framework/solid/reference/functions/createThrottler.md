---
id: createThrottler
title: createThrottler
---

# Function: createThrottler()

```ts
function createThrottler<TFn, TSelected>(
   fn, 
   options, 
selector): SolidThrottler<TFn, TSelected>;
```

Defined in: [solid-pacer/src/throttler/createThrottler.ts:136](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/throttler/createThrottler.ts#L136)

A low-level Solid hook that creates a `Throttler` instance that limits how often the provided function can execute.

This hook is designed to be flexible and state-management agnostic - it simply returns a throttler instance that
you can integrate with any state management solution (createSignal, Redux, Zustand, Jotai, etc). For a simpler and higher-level hook that
integrates directly with Solid's createSignal, see createThrottledSignal.

Throttling ensures a function executes at most once within a specified time window,
regardless of how many times it is called. This is useful for rate-limiting
expensive operations or UI updates.

## State Management and Selector

The hook uses TanStack Store for reactive state management. You can subscribe to state changes
in two ways:

**1. Using `throttler.Subscribe` component (Recommended for component tree subscriptions)**

Use the `Subscribe` component to subscribe to state changes deep in your component tree without
needing to pass a selector to the hook. This is ideal when you want to subscribe to state
in child components.

**2. Using the `selector` parameter (For hook-level subscriptions)**

The `selector` parameter allows you to specify which state changes will trigger reactive updates
at the hook level, optimizing performance by preventing unnecessary updates when irrelevant
state changes occur.

**By default, there will be no reactive state subscriptions** and you must opt-in to state
tracking by providing a selector function or using the `Subscribe` component. This prevents unnecessary
updates and gives you full control over when your component tracks state changes.

Available state properties:
- `canLeadingExecute`: Whether the throttler can execute on the leading edge
- `canTrailingExecute`: Whether the throttler can execute on the trailing edge
- `executionCount`: Number of function executions that have been completed
- `isPending`: Whether the throttler is waiting for the timeout to trigger execution
- `lastArgs`: The arguments from the most recent call to maybeExecute
- `lastExecutionTime`: Timestamp of the last execution
- `nextExecutionTime`: Timestamp of the next allowed execution
- `status`: Current execution status ('disabled' | 'idle' | 'pending')

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

`ThrottlerOptions`\<`TFn`\>

### selector

(`state`) => `TSelected`

## Returns

[`SolidThrottler`](../interfaces/SolidThrottler.md)\<`TFn`, `TSelected`\>

## Example

```tsx
// Default behavior - no reactive state subscriptions
const throttler = createThrottler(setValue, { wait: 1000 });

// Subscribe to state changes deep in component tree using Subscribe component
<throttler.Subscribe selector={(state) => ({ isPending: state.isPending })}>
  {(state) => (
    <div>{state().isPending ? 'Loading...' : 'Ready'}</div>
  )}
</throttler.Subscribe>

// Opt-in to track isPending changes at hook level (optimized for loading states)
const throttler = createThrottler(
  setValue,
  { wait: 1000 },
  (state) => ({ isPending: state.isPending })
);

// Opt-in to track executionCount changes (optimized for tracking execution)
const throttler = createThrottler(
  setValue,
  { wait: 1000 },
  (state) => ({ executionCount: state.executionCount })
);

// Multiple state properties - track when any of these change
const throttler = createThrottler(
  setValue,
  {
    wait: 2000,
    leading: true,   // Execute immediately on first call
    trailing: false  // Skip trailing edge updates
  },
  (state) => ({
    isPending: state.isPending,
    executionCount: state.executionCount,
    lastExecutionTime: state.lastExecutionTime,
    nextExecutionTime: state.nextExecutionTime
  })
);

// Access the selected state (will be empty object {} unless selector provided)
const { isPending, executionCount } = throttler.state();
```
