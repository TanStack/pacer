---
id: useDefaultPacerOptions
title: useDefaultPacerOptions
---

```ts
function useDefaultPacerOptions(host): () => PacerProviderOptions;
```

Defined in: [provider/PacerProvider.ts:79](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/provider/PacerProvider.ts#L79)

Reads local or inherited defaults and refreshes the host when its provider updates.

## Parameters

### host

`ReactiveControllerHost`

## Returns

() => [`PacerProviderOptions`](../interfaces/PacerProviderOptions.md)
