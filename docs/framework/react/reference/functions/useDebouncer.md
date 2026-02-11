---
id: useDebouncer
title: useDebouncer
---

# Function: useDebouncer()

```ts
function useDebouncer<TFn, TSelected>(
   fn, 
   options, 
selector): ReactDebouncer<TFn, TSelected>;
```

Defined in: [react-pacer/src/debouncer/useDebouncer.ts:140](https://github.com/theVedanta/pacer/blob/main/packages/react-pacer/src/debouncer/useDebouncer.ts#L140)

A React hook that creates and manages a Debouncer instance.

This is a lower-level hook that provides direct access to the Debouncer's functionality without
any built-in state management. This allows you to integrate it with any state management solution
you prefer (useState, Redux, Zustand, etc.).

This hook provides debouncing functionality to limit how often a function can be called,
waiting for a specified delay before executing the latest call. This is useful for handling
frequent events like window resizing, scroll events, or real-time search inputs.

The debouncer will only execute the function after the specified wait time has elapsed
since the last call. If the function is called again before the wait time expires, the
timer resets and starts waiting again.

## State Management and Selector

The hook uses TanStack Store for reactive state management. You can subscribe to state changes
in two ways:

**1. Using `debouncer.Subscribe` HOC (Recommended for component tree subscriptions)**

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
- `canLeadingExecute`: Whether the debouncer can execute on the leading edge
- `executionCount`: Number of function executions that have been completed
- `isPending`: Whether the debouncer is waiting for the timeout to trigger execution
- `lastArgs`: The arguments from the most recent call to maybeExecute
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

`DebouncerOptions`\<`TFn`\>

### selector

(`state`) => `TSelected`

## Returns

[`ReactDebouncer`](../interfaces/ReactDebouncer.md)\<`TFn`, `TSelected`\>

## Example

```tsx
// Default behavior - no reactive state subscriptions
const searchDebouncer = useDebouncer(
  (query: string) => fetchSearchResults(query),
  { wait: 500 }
);

// Subscribe to state changes deep in component tree using Subscribe HOC
<searchDebouncer.Subscribe selector={(state) => ({ isPending: state.isPending })}>
  {({ isPending }) => (
    <div>{isPending ? 'Searching...' : 'Ready'}</div>
  )}
</searchDebouncer.Subscribe>

// Opt-in to re-render when isPending changes at hook level (optimized for loading states)
const searchDebouncer = useDebouncer(
  (query: string) => fetchSearchResults(query),
  { wait: 500 },
  (state) => ({ isPending: state.isPending })
);

// Opt-in to re-render when executionCount changes (optimized for tracking execution)
const searchDebouncer = useDebouncer(
  (query: string) => fetchSearchResults(query),
  { wait: 500 },
  (state) => ({ executionCount: state.executionCount })
);

// Multiple state properties - re-render when any of these change
const searchDebouncer = useDebouncer(
  (query: string) => fetchSearchResults(query),
  { wait: 500 },
  (state) => ({
    isPending: state.isPending,
    executionCount: state.executionCount,
    status: state.status
  })
);

// In an event handler
const handleChange = (e) => {
  searchDebouncer.maybeExecute(e.target.value);
};

// Access the selected state (will be empty object {} unless selector provided)
const { isPending } = searchDebouncer.state;
```
