---
id: AlpineQueuerOptions
title: AlpineQueuerOptions
---

Defined in: [queuer/createQueuer.ts:8](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/queuer/createQueuer.ts#L8)

Options for createQueuer, including owner cleanup.

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

Defined in: [queuer/createQueuer.ts:13](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/queuer/createQueuer.ts#L13)

Replaces default cleanup. Use this to flush, cancel, or stop pending work.

#### Parameters

##### instance

[`AlpineQueuer`](AlpineQueuer.md)\<`TValue`, `TSelected`\>

#### Returns

`void`
