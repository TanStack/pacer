---
id: injectAsyncDebouncer
title: injectAsyncDebouncer
---

# Function: injectAsyncDebouncer()

```ts
function injectAsyncDebouncer<TFn, TSelected>(
   fn, 
   options, 
selector): AngularAsyncDebouncer<TFn, TSelected>;
```

Defined in: [angular-pacer/src/async-debouncer/injectAsyncDebouncer.ts:92](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/async-debouncer/injectAsyncDebouncer.ts#L92)

An Angular function that creates and manages an AsyncDebouncer instance.

This is a lower-level function that provides direct access to the AsyncDebouncer's functionality.
This allows you to integrate it with any state management solution you prefer.

This function provides async debouncing functionality with promise support, error handling,
retry capabilities, and abort support.

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
- `errorCount`: Number of function executions that have resulted in errors
- `isExecuting`: Whether the debounced function is currently executing asynchronously
- `isPending`: Whether the debouncer is waiting for the timeout to trigger execution
- `lastArgs`: The arguments from the most recent call to maybeExecute
- `lastResult`: The result from the most recent successful function execution
- `settleCount`: Number of function executions that have completed (either successfully or with errors)
- `status`: Current execution status ('disabled' | 'idle' | 'pending' | 'executing' | 'settled')
- `successCount`: Number of function executions that have completed successfully

## Type Parameters

### TFn

`TFn` *extends* `AnyAsyncFunction`

### TSelected

`TSelected` = \{
\}

## Parameters

### fn

`TFn`

### options

`AsyncDebouncerOptions`\<`TFn`\>

### selector

(`state`) => `TSelected`

## Returns

[`AngularAsyncDebouncer`](../interfaces/AngularAsyncDebouncer.md)\<`TFn`, `TSelected`\>

## Example

```ts
// Default behavior - no reactive state subscriptions
const debouncer = injectAsyncDebouncer(
  async (query: string) => {
    const response = await fetch(`/api/search?q=${query}`);
    return response.json();
  },
  { wait: 500 }
);

// Opt-in to track isExecuting changes (optimized for loading states)
const debouncer = injectAsyncDebouncer(
  async (query: string) => fetchSearchResults(query),
  { wait: 500 },
  (state) => ({ isExecuting: state.isExecuting, isPending: state.isPending })
);

// In an event handler
const handleChange = async (e: Event) => {
  const target = e.target as HTMLInputElement;
  const result = await debouncer.maybeExecute(target.value);
  console.log('Search results:', result);
};

// Access the selected state
const { isExecuting, errorCount } = debouncer.state();
```
