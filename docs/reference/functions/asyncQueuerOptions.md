---
id: asyncQueuerOptions
title: asyncQueuerOptions
---

# Function: asyncQueuerOptions()

```ts
function asyncQueuerOptions<TValue, TOptions>(options): TOptions;
```

Defined in: [async-queuer.ts:219](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/async-queuer.ts#L219)

Utility function for sharing common `AsyncQueuerOptions` options between different `AsyncQueuer` instances.

## Type Parameters

### TValue

`TValue` = `any`

### TOptions

`TOptions` *extends* `Partial`\<[`AsyncQueuerOptions`](../interfaces/AsyncQueuerOptions.md)\<`TValue`\>\> = `Partial`\<[`AsyncQueuerOptions`](../interfaces/AsyncQueuerOptions.md)\<`TValue`\>\>

## Parameters

### options

`TOptions`

## Returns

`TOptions`
