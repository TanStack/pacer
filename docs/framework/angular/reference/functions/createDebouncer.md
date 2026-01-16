---
id: createDebouncer
title: createDebouncer
---

# Function: createDebouncer()

```ts
function createDebouncer<TFn, TSelected>(
   fn, 
   options, 
selector): AngularDebouncer<TFn, TSelected>;
```

Defined in: [angular-pacer/src/debouncer/createDebouncer.ts:85](https://github.com/theVedanta/pacer/blob/main/packages/angular-pacer/src/debouncer/createDebouncer.ts#L85)

An Angular function that creates and manages a Debouncer instance.

This is a lower-level function that provides direct access to the Debouncer's functionality.
This allows you to integrate it with any state management solution you prefer.

This function provides debouncing functionality to limit how often a function can be called,
waiting for a specified delay before executing the latest call. This is useful for handling
frequent events like window resizing, scroll events, or real-time search inputs.

The debouncer will only execute the function after the specified wait time has elapsed
since the last call. If the function is called again before the wait time expires, the
timer resets and starts waiting again.

## State Management and Selector

The function uses TanStack Store for state management and wraps it with Angular signals.
The `selector` parameter allows you to specify which state changes will trigger signal updates,
optimizing performance by preventing unnecessary updates when irrelevant state changes occur.

**By default, there will be no reactive state subscriptions** and you must opt-in to state
tracking by providing a selector function. This prevents unnecessary updates and gives you
full control over when your component tracks state changes.

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

[`AngularDebouncer`](../interfaces/AngularDebouncer.md)\<`TFn`, `TSelected`\>

## Example

```ts
// Default behavior - no reactive state subscriptions
const debouncer = createDebouncer(
  (query: string) => fetchSearchResults(query),
  { wait: 500 }
);

// Opt-in to track isPending changes (optimized for loading states)
const debouncer = createDebouncer(
  (query: string) => fetchSearchResults(query),
  { wait: 500 },
  (state) => ({ isPending: state.isPending })
);

// In an event handler
const handleChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  debouncer.maybeExecute(target.value);
};

// Access the selected state (will be empty object {} unless selector provided)
const { isPending } = debouncer.state();
```
