---
id: useDebouncedValue
title: useDebouncedValue
---

<!-- DO NOT EDIT: this page is autogenerated from the type comments -->

# Function: useDebouncedValue()

```ts
function useDebouncedValue<TValue>(value, options): readonly [TValue, {
  cancel: () => void;
  getExecutionCount: () => number;
  maybeExecute: (...args) => void;
 }]
```

Defined in: [react-pacer/src/debouncer/useDebouncedValue.ts:41](https://github.com/TanStack/pacer/blob/main/packages/react-pacer/src/debouncer/useDebouncedValue.ts#L41)

A React hook that creates a debounced value that updates only after a specified delay.
Unlike useDebouncedState, this hook automatically tracks changes to the input value
and updates the debounced value accordingly.

The debounced value will only update after the specified wait time has elapsed since
the last change to the input value. If the input value changes again before the wait
time expires, the timer resets and starts waiting again.

This is useful for deriving debounced values from props or state that change frequently,
like search queries or form inputs, where you want to limit how often downstream effects
or calculations occur.

The hook returns a tuple containing:
- The current debounced value
- The debouncer instance with control methods

## Type Parameters

• **TValue**

## Parameters

### value

`TValue`

### options

`DebouncerOptions`

## Returns

readonly \[`TValue`, \{
  `cancel`: () => `void`;
  `getExecutionCount`: () => `number`;
  `maybeExecute`: (...`args`) => `void`;
 \}\]

## Example

```tsx
// Debounce a search query
const [searchQuery, setSearchQuery] = useState('');
const [debouncedQuery, debouncer] = useDebouncedValue(searchQuery, {
  wait: 500 // Wait 500ms after last change
});

// debouncedQuery will update 500ms after searchQuery stops changing
useEffect(() => {
  fetchSearchResults(debouncedQuery);
}, [debouncedQuery]);

// Handle input changes
const handleChange = (e) => {
  setSearchQuery(e.target.value);
};
```
