---
id: createDebouncedValue
title: createDebouncedValue
---

# Function: createDebouncedValue()

```ts
function createDebouncedValue<TValue, TSelected>(
   value, 
   initialOptions, 
   selector?): [Accessor<TValue>, SolidDebouncer<Setter<TValue>, TSelected>];
```

Defined in: [solid-pacer/src/debouncer/createDebouncedValue.ts:72](https://github.com/theVedanta/pacer/blob/main/packages/solid-pacer/src/debouncer/createDebouncedValue.ts#L72)

A Solid hook that creates a debounced value that updates only after a specified delay.
Unlike createDebouncedSignal, this hook automatically tracks changes to the input value
and updates the debounced value accordingly.

The debounced value will only update after the specified wait time has elapsed since
the last change to the input value. If the input value changes again before the wait
time expires, the timer resets and starts waiting again.

This is useful for deriving debounced values from props or state that change frequently,
like search queries or form inputs, where you want to limit how often downstream effects
or calculations occur.

The hook returns a tuple containing:
- An Accessor that provides the current debounced value
- The debouncer instance with control methods

## State Management and Selector

The hook uses TanStack Store for reactive state management via the underlying debouncer instance.
The `selector` parameter allows you to specify which debouncer state changes will trigger reactive updates,
optimizing performance by preventing unnecessary subscriptions when irrelevant state changes occur.

**By default, there will be no reactive state subscriptions** and you must opt-in to state
tracking by providing a selector function. This prevents unnecessary reactive updates and gives you
full control over when your component subscribes to state changes. Only when you provide a selector will
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

`Accessor`\<`TValue`\>

### initialOptions

`DebouncerOptions`\<`Setter`\<`TValue`\>\>

### selector?

(`state`) => `TSelected`

## Returns

\[`Accessor`\<`TValue`\>, [`SolidDebouncer`](../interfaces/SolidDebouncer.md)\<`Setter`\<`TValue`\>, `TSelected`\>\]

## Example

```tsx
// Default behavior - no reactive state subscriptions
const [searchQuery, setSearchQuery] = createSignal('');
const [debouncedQuery, debouncer] = createDebouncedValue(searchQuery, {
  wait: 500 // Wait 500ms after last change
});

// Opt-in to reactive updates when pending state changes (optimized for loading indicators)
const [debouncedQuery, debouncer] = createDebouncedValue(
  searchQuery,
  { wait: 500 },
  (state) => ({ isPending: state.isPending })
);

// debouncedQuery will update 500ms after searchQuery stops changing
createEffect(() => {
  fetchSearchResults(debouncedQuery());
});

// Access debouncer state via signals
console.log('Is pending:', debouncer.state().isPending);

// Control the debouncer
debouncer.cancel(); // Cancel any pending updates
```
