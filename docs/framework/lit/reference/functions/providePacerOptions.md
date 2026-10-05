---
id: providePacerOptions
title: providePacerOptions
---

```ts
function providePacerOptions(host, options): void;
```

Defined in: [provider/PacerProvider.ts:55](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/provider/PacerProvider.ts#L55)

Supplies reactive defaults for this host and its descendants, including across
shadow roots. Call during construction, before creating utilities. The nearest
provider wins, and each utility's local options override provider defaults.

## Parameters

### host

`ReactiveControllerHost`

### options

[`LitPacerOptions`](../type-aliases/LitPacerOptions.md)\<[`PacerProviderOptions`](../interfaces/PacerProviderOptions.md)\>

## Returns

`void`

## Example

```ts
constructor() {
  super()
  providePacerOptions(this, () => ({
    debouncer: { leading: this.leading },
  }))
}
```
