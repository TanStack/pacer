---
id: createScope
title: createScope
---

```ts
function createScope(defaultOptions?): PacerScope;
```

Defined in: [provider/PacerProvider.ts:38](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/provider/PacerProvider.ts#L38)

Creates a lifecycle scope. Call destroy from Alpine's destroy hook when used manually.

## Parameters

### defaultOptions?

[`AlpinePacerOptions`](../type-aliases/AlpinePacerOptions.md)\<[`PacerProviderOptions`](../interfaces/PacerProviderOptions.md)\> = `{}`

## Returns

[`PacerScope`](../interfaces/PacerScope.md)
