---
id: EmberQueuerOptions
title: EmberQueuerOptions
---

Defined in: [packages/ember-pacer/src/queuer/useQueuer.ts:16](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/queuer/useQueuer.ts#L16)

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

Defined in: [packages/ember-pacer/src/queuer/useQueuer.ts:21](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/queuer/useQueuer.ts#L21)

Replaces default cleanup. Use this to flush, cancel, or stop pending work.

#### Parameters

##### instance

[`EmberQueuer`](EmberQueuer.md)\<`TValue`, `TSelected`\>

#### Returns

`void`
