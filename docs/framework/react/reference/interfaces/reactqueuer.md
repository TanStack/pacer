---
id: ReactQueuer
title: ReactQueuer
---

<!-- DO NOT EDIT: this page is autogenerated from the type comments -->

# Interface: ReactQueuer\<TValue, TSelected\>

Defined in: [react-pacer/src/queuer/useQueuer.ts:6](https://github.com/TanStack/pacer/blob/main/packages/react-pacer/src/queuer/useQueuer.ts#L6)

## Extends

- `Omit`\<`Queuer`\<`TValue`\>, `"store"`\>

## Type Parameters

• **TValue**

• **TSelected** = `QueuerState`\<`TValue`\>

## Properties

### state

```ts
readonly state: Readonly<TSelected>;
```

Defined in: [react-pacer/src/queuer/useQueuer.ts:13](https://github.com/TanStack/pacer/blob/main/packages/react-pacer/src/queuer/useQueuer.ts#L13)

Reactive state that will be updated and re-rendered when the queuer state changes

Use this instead of `queuer.store.state`
