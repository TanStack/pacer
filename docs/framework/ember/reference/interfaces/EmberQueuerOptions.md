---
id: EmberQueuerOptions
title: EmberQueuerOptions
---

Defined in: [packages/ember-pacer/src/queuer/useQueuer.ts:13](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/queuer/useQueuer.ts#L13)

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

Defined in: [packages/ember-pacer/src/queuer/useQueuer.ts:18](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/queuer/useQueuer.ts#L18)

Replaces default cleanup. Use this to flush, cancel, or stop pending work.

#### Parameters

##### instance

[`EmberQueuer`](EmberQueuer.md)\<`TValue`, `TSelected`\>

#### Returns

`void`
