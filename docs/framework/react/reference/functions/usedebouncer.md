---
id: useDebouncer
title: useDebouncer
---

<!-- DO NOT EDIT: this page is autogenerated from the type comments -->

# Function: useDebouncer()

```ts
function useDebouncer<TFn, TSelected>(
   fn, 
   options, 
selector?): ReactDebouncer<TFn, TSelected>
```

Defined in: [react-pacer/src/debouncer/useDebouncer.ts:96](https://github.com/TanStack/pacer/blob/main/packages/react-pacer/src/debouncer/useDebouncer.ts#L96)

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

The hook uses TanStack Store for reactive state management. The `selector` parameter allows you
to specify which state changes will trigger a re-render, optimizing performance by preventing
unnecessary re-renders when irrelevant state changes occur.

**By default, all state changes will trigger a re-render.** To optimize performance, you can
provide a selector function that returns only the specific state values your component needs.
The component will only re-render when the selected values change.

Available state properties:
- `canLeadingExecute`: Whether the debouncer can execute on the leading edge
- `executionCount`: Number of function executions that have been completed
- `isPending`: Whether the debouncer is waiting for the timeout to trigger execution
- `lastArgs`: The arguments from the most recent call to maybeExecute
- `status`: Current execution status ('disabled' | 'idle' | 'pending')

## Type Parameters

• **TFn** *extends* `AnyFunction`

• **TSelected** = `DebouncerState`\<`TFn`\>

## Parameters

### fn

`TFn`

### options

`DebouncerOptions`\<`TFn`\>

### selector?

(`state`) => `TSelected`

## Returns

[`ReactDebouncer`](../../interfaces/reactdebouncer.md)\<`TFn`, `TSelected`\>

## Example

```tsx
// Default behavior - re-renders on any state change
const searchDebouncer = useDebouncer(
  (query: string) => fetchSearchResults(query),
  { wait: 500 }
);

// Only re-render when isPending changes (optimized for loading states)
const searchDebouncer = useDebouncer(
  (query: string) => fetchSearchResults(query),
  { wait: 500 },
  (state) => ({ isPending: state.isPending })
);

// Only re-render when executionCount changes (optimized for tracking execution)
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

// Access the selected state
const { isPending } = searchDebouncer.state;
```
