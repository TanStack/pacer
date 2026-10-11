---
id: LitAsyncQueuer
title: LitAsyncQueuer
---

Defined in: [async-queuer/createAsyncQueuer.ts:22](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/async-queuer/createAsyncQueuer.ts#L22)

An AsyncQueuer with framework-reactive selected state. All core methods remain available.

## Extends

- `Omit`\<`AsyncQueuer`\<`TValue`\>, `"options"` \| `"setOptions"`\>

## Type Parameters

### TValue

`TValue`

### TSelected

`TSelected` = \{
\}

## Properties

### options

```ts
options: AsyncQueuerOptions<TValue> & LitAsyncQueuerOptions<TValue, TSelected>;
```

Defined in: [async-queuer/createAsyncQueuer.ts:26](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/async-queuer/createAsyncQueuer.ts#L26)

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [async-queuer/createAsyncQueuer.ts:28](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/async-queuer/createAsyncQueuer.ts#L28)

#### Parameters

##### options

`Partial`\<[`LitAsyncQueuerOptions`](LitAsyncQueuerOptions.md)\<`TValue`, `TSelected`\>\>

#### Returns

`void`

***

### state

```ts
readonly state: Readonly<TSelected>;
```

Defined in: [async-queuer/createAsyncQueuer.ts:34](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/async-queuer/createAsyncQueuer.ts#L34)

Selected state. Pass a selector to opt in; the default selection is an empty object.

***

### subscribe

```ts
subscribe: LitPacerSubscribe<AsyncQueuerState<TValue>>;
```

Defined in: [async-queuer/createAsyncQueuer.ts:32](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/async-queuer/createAsyncQueuer.ts#L32)

Subscribes a child owner to selected state with automatic cleanup.
