---
id: createDebouncedSignal
title: createDebouncedSignal
---

# Function: createDebouncedSignal()

```ts
function createDebouncedSignal<TValue, TSelected>(
   value, 
   initialOptions, 
selector?): DebouncedSignal<TValue, TSelected>;
```

Defined in: [angular-pacer/src/debouncer/createDebouncedSignal.ts:87](https://github.com/theVedanta/pacer/blob/main/packages/angular-pacer/src/debouncer/createDebouncedSignal.ts#L87)

An Angular function that creates a debounced state signal, combining Angular's signal with debouncing functionality.
This function provides both the current debounced value and methods to update it.

The state value is only updated after the specified wait time has elapsed since the last update attempt.
If another update is attempted before the wait time expires, the timer resets and starts waiting again.
This is useful for handling frequent state updates that should be throttled, like search input values
or window resize dimensions.

The function returns an object containing:
- `value`: The current debounced value signal
- `setValue`: A function to update the debounced value
- `debouncer`: The debouncer instance with additional control methods and state signals

## State Management and Selector

The function uses TanStack Store for reactive state management via the underlying debouncer instance.
The `selector` parameter allows you to specify which debouncer state changes will trigger signal updates,
optimizing performance by preventing unnecessary subscriptions when irrelevant state changes occur.

**By default, there will be no reactive state subscriptions** and you must opt-in to state
tracking by providing a selector function. This prevents unnecessary updates and gives you
full control over when your component tracks state changes. Only when you provide a selector will
the reactive system track the selected state values.

Available debouncer state properties:
- `canLeadingExecute`: Whether the debouncer can execute on the leading edge
- `executionCount`: Number of function executions that have been completed
- `isPending`: Whether the debouncer is waiting for the timeout to trigger execution
- `lastArgs`: The arguments from the most recent call to maybeExecute
- `status`: Current execution status ('disabled' | 'idle' | 'pending')

## Type Parameters

### TValue

`TValue`

### TSelected

`TSelected` = \{
\}

## Parameters

### value

`TValue`

### initialOptions

`DebouncerOptions`\<`Setter`\<`TValue`\>\>

### selector?

(`state`) => `TSelected`

## Returns

[`DebouncedSignal`](../interfaces/DebouncedSignal.md)\<`TValue`, `TSelected`\>

## Example

```ts
// Default behavior - no reactive state subscriptions
const debounced = createDebouncedSignal('', {
  wait: 500 // Wait 500ms after last keystroke
});

// Opt-in to reactive updates when pending state changes (optimized for loading indicators)
const debounced = createDebouncedSignal(
  '',
  { wait: 500 },
  (state) => ({ isPending: state.isPending })
);

// Update value - will be debounced
const handleChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  debounced.setValue(target.value);
};

// Access debounced value
console.log('Search term:', debounced.value());

// Access debouncer state via signals
console.log('Executions:', debounced.debouncer.state().executionCount);
console.log('Is pending:', debounced.debouncer.state().isPending);
```
