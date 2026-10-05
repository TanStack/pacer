---
id: OctaneQueuerOptions
title: OctaneQueuerOptions
---

Defined in: [queuer/useQueuer.ts:12](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/queuer/useQueuer.ts#L12)

Options for useQueuer, including owner cleanup.

## Extends

- `QueuerOptions`\<`TValue`\>

## Type Parameters

### TValue

`TValue`

### TSelected

`TSelected` = \{
\}

## Properties

### onUnmount?

```ts
optional onUnmount?: (instance) => void;
```

Defined in: [queuer/useQueuer.ts:17](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/queuer/useQueuer.ts#L17)

Replaces default cleanup. Use this to flush, cancel, or stop pending work.

#### Parameters

##### instance

[`OctaneQueuer`](OctaneQueuer.md)\<`TValue`, `TSelected`\>

#### Returns

`void`
