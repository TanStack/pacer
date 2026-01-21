---
id: injectDebouncedValue
title: injectDebouncedValue
---

# Function: injectDebouncedValue()

```ts
function injectDebouncedValue<TValue, TSelected>(
   value, 
   initialOptions, 
selector?): DebouncedSignal<TValue>;
```

Defined in: [debouncer/injectDebouncedValue.ts:80](https://github.com/theVedanta/pacer/blob/main/packages/angular-pacer/src/debouncer/injectDebouncedValue.ts#L80)

An Angular function that creates a debounced value that updates only after a specified delay.
Unlike injectDebouncedSignal, this function automatically tracks changes to the input signal
and updates the debounced value accordingly.

The debounced value will only update after the specified wait time has elapsed since
the last change to the input value. If the input value changes again before the wait
time expires, the timer resets and starts waiting again.

This is useful for deriving debounced values from signals that change frequently,
like search queries or form inputs, where you want to limit how often downstream effects
or calculations occur.

The function returns a tuple containing:
- A Signal that provides the current debounced value
- The debouncer instance with control methods

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

## Handling Input Signals

The input value is wrapped in a `linkedSignal` to defer reads of Angular input signals
until they are ready. This prevents `NG0729: Input signals not ready` errors that occur
when a signal input is accessed during component field initialization.

## Type Parameters

### TValue

`TValue`

### TSelected

`TSelected` = \{
\}

## Parameters

### value

`Signal`\<`TValue`\>

### initialOptions

`DebouncerOptions`\<`Setter`\<`TValue`\>\>

### selector?

(`state`) => `TSelected`

## Returns

[`DebouncedSignal`](../type-aliases/DebouncedSignal.md)\<`TValue`\>

## Example

```ts
// Default behavior - no reactive state subscriptions
const searchQuery = signal('');
const [debouncedQuery, debouncer] = injectDebouncedValue(searchQuery, {
  wait: 500 // Wait 500ms after last change
});

// Opt-in to reactive updates when pending state changes (optimized for loading indicators)
const [debouncedQuery, debouncer] = injectDebouncedValue(
  searchQuery,
  { wait: 500 },
  (state) => ({ isPending: state.isPending })
);

// debouncedQuery will update 500ms after searchQuery stops changing
effect(() => {
  fetchSearchResults(debouncedQuery());
});

// Access debouncer state via signals
console.log('Is pending:', debouncer.state().isPending);

// Control the debouncer
debouncer.cancel(); // Cancel any pending updates
```
