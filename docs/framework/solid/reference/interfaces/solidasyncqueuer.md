---
id: SolidAsyncQueuer
title: SolidAsyncQueuer
---

<!-- DO NOT EDIT: this page is autogenerated from the type comments -->

# Interface: SolidAsyncQueuer\<TValue, TSelected\>

Defined in: [async-queuer/createAsyncQueuer.ts:9](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/async-queuer/createAsyncQueuer.ts#L9)

## Extends

- `Omit`\<`AsyncQueuer`\<`TValue`\>, `"store"`\>

## Type Parameters

• **TValue**

• **TSelected** = `AsyncQueuerState`\<`TValue`\>

## Properties

### state

```ts
readonly state: Accessor<Readonly<TSelected>>;
```

Defined in: [async-queuer/createAsyncQueuer.ts:16](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/async-queuer/createAsyncQueuer.ts#L16)

Reactive state that will be updated and re-rendered when the queuer state changes

Use this instead of `queuer.store.state`
