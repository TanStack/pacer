---
id: providePacerOptions
title: providePacerOptions
---

```ts
function providePacerOptions(options): Provider;
```

Defined in: packages/angular-pacer/src/provider/providePacerOptions.ts:67

Provides scoped defaults for Angular Pacer utilities.

Place this provider in application, route, or component providers. The nearest
provider supplies the defaults; local utility options take precedence. A nested
provider replaces the outer defaults rather than merging scopes.

## Parameters

### options

[`PacerProviderOptions`](../interfaces/PacerProviderOptions.md)

Partial default options grouped by utility.

## Returns

`Provider`

An Angular provider for the supplied defaults.

## Example

```ts
const appConfig = {
  providers: [
    providePacerOptions({ debouncer: { wait: 250 } }),
  ],
}
```
