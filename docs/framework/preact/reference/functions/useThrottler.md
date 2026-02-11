---
id: useThrottler
title: useThrottler
---

# Function: useThrottler()

```ts
function useThrottler<TFn, TSelected>(
   fn, 
   options, 
selector): PreactThrottler<TFn, TSelected>;
```

Defined in: [preact-pacer/src/throttler/useThrottler.ts:145](https://github.com/theVedanta/pacer/blob/main/packages/preact-pacer/src/throttler/useThrottler.ts#L145)

A low-level Preact hook that creates a `Throttler` instance that limits how often the provided function can execute.

This hook is designed to be flexible and state-management agnostic - it simply returns a throttler instance that
you can integrate with any state management solution (useState, Redux, Zustand, Jotai, etc). For a simpler and higher-level hook that
integrates directly with Preact's useState, see useThrottledState.

Throttling ensures a function executes at most once within a specified time window,
regardless of how many times it is called. This is useful for rate-limiting
expensive operations or UI updates.

## State Management and Selector

The hook uses TanStack Store for reactive state management. You can subscribe to state changes
in two ways:

**1. Using `throttler.Subscribe` HOC (Recommended for component tree subscriptions)**

Use the `Subscribe` HOC to subscribe to state changes deep in your component tree without
needing to pass a selector to the hook. This is ideal when you want to subscribe to state
in child components.

**2. Using the `selector` parameter (For hook-level subscriptions)**

The `selector` parameter allows you to specify which state changes will trigger a re-render
at the hook level, optimizing performance by preventing unnecessary re-renders when irrelevant
state changes occur.

**By default, there will be no reactive state subscriptions** and you must opt-in to state
tracking by providing a selector function or using the `Subscribe` HOC. This prevents unnecessary
re-renders and gives you full control over when your component updates.

Available state properties:
- `executionCount`: Number of function executions that have been completed
- `lastArgs`: The arguments from the most recent call to maybeExecute
- `lastExecutionTime`: Timestamp of the last function execution in milliseconds
- `nextExecutionTime`: Timestamp when the next execution can occur in milliseconds
- `isPending`: Whether the throttler is waiting for the timeout to trigger execution
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

[`PreactThrottler`](../interfaces/PreactThrottler.md)\<`TFn`, `TSelected`\>

## Example

```tsx
// Default behavior - no reactive state subscriptions
const [value, setValue] = useState(0);
const throttler = useThrottler(setValue, { wait: 1000 });

// Subscribe to state changes deep in component tree using Subscribe HOC
<throttler.Subscribe selector={(state) => ({ isPending: state.isPending })}>
  {({ isPending }) => (
    <div>{isPending ? 'Processing...' : 'Ready'}</div>
  )}
</throttler.Subscribe>

// Opt-in to re-render when execution count changes at hook level (optimized for tracking executions)
const [value, setValue] = useState(0);
const throttler = useThrottler(
  setValue,
  { wait: 1000 },
  (state) => ({ executionCount: state.executionCount })
);

// Opt-in to re-render when throttling state changes (optimized for loading indicators)
const [value, setValue] = useState(0);
const throttler = useThrottler(
  setValue,
  { wait: 1000 },
  (state) => ({
    isPending: state.isPending,
    status: state.status
  })
);

// Opt-in to re-render when timing information changes (optimized for timing displays)
const [value, setValue] = useState(0);
const throttler = useThrottler(
  setValue,
  { wait: 1000 },
  (state) => ({
    lastExecutionTime: state.lastExecutionTime,
    nextExecutionTime: state.nextExecutionTime
  })
);

// With any state manager
const throttler = useThrottler(
  (value) => stateManager.setState(value),
  {
    wait: 2000,
    leading: true,   // Execute immediately on first call
    trailing: false  // Skip trailing edge updates
  }
);

// Access the selected state (will be empty object {} unless selector provided)
const { executionCount, isPending } = throttler.state;
```
