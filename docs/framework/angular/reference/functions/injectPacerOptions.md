---
id: injectPacerOptions
title: injectPacerOptions
---

```ts
function injectPacerOptions(): PacerProviderOptions;
```

Defined in: [packages/angular-pacer/src/provider/providePacerOptions.ts:79](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/provider/providePacerOptions.ts#L79)

Reads the nearest Pacer options provider in the current injection context.
Returns an empty object when no provider is configured.

## Returns

[`PacerProviderOptions`](../interfaces/PacerProviderOptions.md)

The scoped default options.
