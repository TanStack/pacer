---
id: useThrottler
title: useThrottler
---

<!-- DO NOT EDIT: this page is autogenerated from the type comments -->

# Function: useThrottler()

```ts
function useThrottler<TFn, TArgs>(fn, options): object
```

Defined in: [react-pacer/src/throttler/useThrottler.ts:5](https://github.com/TanStack/bouncer/blob/main/packages/react-pacer/src/throttler/useThrottler.ts#L5)

## Type Parameters

• **TFn** *extends* (...`args`) => `any`

• **TArgs** *extends* `any`[]

## Parameters

### fn

`TFn`

### options

`ThrottlerOptions`

## Returns

`object`

### cancel()

```ts
readonly cancel: () => void;
```

Cancels any pending execution

#### Returns

`void`

### getExecutionCount()

```ts
readonly getExecutionCount: () => number;
```

Returns the number of times the function has been executed

#### Returns

`number`

### maybeExecute()

```ts
readonly maybeExecute: (...args) => void;
```

Executes the throttled function

#### Parameters

##### args

...`TArgs`

#### Returns

`void`
