---
id: createDebouncer
title: createDebouncer
---

# Function: createDebouncer()

```ts
function createDebouncer<TFn, TSelected>(
   fn, 
   options, 
selector): SolidDebouncer<TFn, TSelected>;
```

Defined in: [solid-pacer/src/debouncer/createDebouncer.ts:104](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/debouncer/createDebouncer.ts#L104)

A Solid hook that creates and manages a Debouncer instance.

This is a lower-level hook that provides direct access to the Debouncer's functionality without
any built-in state management. This allows you to integrate it with any state management solution
you prefer (createSignal, Redux, Zustand, etc.).

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

**By default, there will be no reactive state subscriptions** and you must opt-in to state
tracking by providing a selector function. This prevents unnecessary re-renders and gives you
full control over when your component updates. Only when you provide a selector will the
component re-render when the selected state values change.

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

[`SolidDebouncer`](../../interfaces/SolidDebouncer.md)\<`TFn`, `TSelected`\>

## Example

```tsx
// Default behavior - no reactive state subscriptions
const debouncer = createDebouncer(
  (query: string) => fetchSearchResults(query),
  { wait: 500 }
);

// Opt-in to re-render when isPending changes (optimized for loading states)
const debouncer = createDebouncer(
  (query: string) => fetchSearchResults(query),
  { wait: 500 },
  (state) => ({ isPending: state.isPending })
);

// Opt-in to re-render when executionCount changes (optimized for tracking execution)
const debouncer = createDebouncer(
  (query: string) => fetchSearchResults(query),
  { wait: 500 },
  (state) => ({ executionCount: state.executionCount })
);

// Multiple state properties - re-render when any of these change
const debouncer = createDebouncer(
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
  debouncer.maybeExecute(e.target.value);
};

// Access the selected state (will be empty object {} unless selector provided)
const { isPending } = debouncer.state();
```
