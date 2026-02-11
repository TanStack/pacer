---
id: queuerOptions
title: queuerOptions
---

# Function: queuerOptions()

```ts
function queuerOptions<TValue, TOptions>(options): TOptions;
```

Defined in: [queuer.ts:157](https://github.com/theVedanta/pacer/blob/main/packages/pacer/src/queuer.ts#L157)

Utility function for sharing common `QueuerOptions` options between different `Queuer` instances.

## Type Parameters

### TValue

`TValue` = `any`

### TOptions

`TOptions` *extends* `Partial`\<[`QueuerOptions`](../interfaces/QueuerOptions.md)\<`TValue`\>\> = `Partial`\<[`QueuerOptions`](../interfaces/QueuerOptions.md)\<`TValue`\>\>

## Parameters

### options

`TOptions`

## Returns

`TOptions`
