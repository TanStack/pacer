---
id: EmberAsyncQueuerOptions
title: EmberAsyncQueuerOptions
---

Defined in: [packages/ember-pacer/src/async-queuer/useAsyncQueuer.ts:16](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/async-queuer/useAsyncQueuer.ts#L16)

Options for useAsyncQueuer, including owner cleanup.

## Extends

- `AsyncQueuerOptions`\<`TValue`\>

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

Defined in: [packages/ember-pacer/src/async-queuer/useAsyncQueuer.ts:21](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/async-queuer/useAsyncQueuer.ts#L21)

Replaces default cleanup. Use this to flush, cancel, or stop pending work.

#### Parameters

##### instance

[`EmberAsyncQueuer`](EmberAsyncQueuer.md)\<`TValue`, `TSelected`\>

#### Returns

`void`
