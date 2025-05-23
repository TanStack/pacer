---
id: SolidAsyncDebouncer
title: SolidAsyncDebouncer
---

<!-- DO NOT EDIT: this page is autogenerated from the type comments -->

# Interface: SolidAsyncDebouncer\<TFn\>

Defined in: [async-debouncer/createAsyncDebouncer.ts:8](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/async-debouncer/createAsyncDebouncer.ts#L8)

## Extends

- `Omit`\<`AsyncDebouncer`\<`TFn`\>, 
  \| `"getErrorCount"`
  \| `"getIsPending"`
  \| `"getLastResult"`
  \| `"getSettleCount"`
  \| `"getSuccessCount"`\>

## Type Parameters

• **TFn** *extends* `AnyAsyncFunction`

## Properties

### errorCount

```ts
errorCount: Accessor<number>;
```

Defined in: [async-debouncer/createAsyncDebouncer.ts:17](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/async-debouncer/createAsyncDebouncer.ts#L17)

***

### isPending

```ts
isPending: Accessor<boolean>;
```

Defined in: [async-debouncer/createAsyncDebouncer.ts:18](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/async-debouncer/createAsyncDebouncer.ts#L18)

***

### lastResult

```ts
lastResult: Accessor<undefined | ReturnType<TFn>>;
```

Defined in: [async-debouncer/createAsyncDebouncer.ts:19](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/async-debouncer/createAsyncDebouncer.ts#L19)

***

### settleCount

```ts
settleCount: Accessor<number>;
```

Defined in: [async-debouncer/createAsyncDebouncer.ts:20](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/async-debouncer/createAsyncDebouncer.ts#L20)

***

### successCount

```ts
successCount: Accessor<number>;
```

Defined in: [async-debouncer/createAsyncDebouncer.ts:21](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/async-debouncer/createAsyncDebouncer.ts#L21)
