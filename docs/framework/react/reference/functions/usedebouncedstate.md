---
id: useDebouncedState
title: useDebouncedState
---

<!-- DO NOT EDIT: this page is autogenerated from the type comments -->

# Function: useDebouncedState()

```ts
function useDebouncedState<TValue>(value, options): readonly [TValue, (...args) => void, {
  cancel: () => void;
  getExecutionCount: () => number;
  maybeExecute: (...args) => void;
 }]
```

Defined in: [react-pacer/src/debouncer/useDebouncedState.ts:5](https://github.com/TanStack/bouncer/blob/main/packages/react-pacer/src/debouncer/useDebouncedState.ts#L5)

## Type Parameters

• **TValue**

## Parameters

### value

`TValue`

### options

`DebouncerOptions`

## Returns

readonly \[`TValue`, (...`args`) => `void`, \{
  `cancel`: () => `void`;
  `getExecutionCount`: () => `number`;
  `maybeExecute`: (...`args`) => `void`;
 \}\]
