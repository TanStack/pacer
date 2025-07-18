---
id: SolidBatcher
title: SolidBatcher
---

<!-- DO NOT EDIT: this page is autogenerated from the type comments -->

# Interface: SolidBatcher\<TValue, TSelected\>

Defined in: [batcher/createBatcher.ts:6](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/batcher/createBatcher.ts#L6)

## Extends

- `Omit`\<`Batcher`\<`TValue`\>, `"store"`\>

## Type Parameters

• **TValue**

• **TSelected** = `BatcherState`\<`TValue`\>

## Properties

### state

```ts
readonly state: Accessor<Readonly<TSelected>>;
```

Defined in: [batcher/createBatcher.ts:13](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/batcher/createBatcher.ts#L13)

Reactive state that will be updated when the batcher state changes

Use this instead of `batcher.store.state`
