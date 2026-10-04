---
id: AlpineAsyncQueuer
title: AlpineAsyncQueuer
---

Defined in: [async-queuer/createAsyncQueuer.ts:21](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/async-queuer/createAsyncQueuer.ts#L21)

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
options: AsyncQueuerOptions<TValue> & AlpineAsyncQueuerOptions<TValue, TSelected>;
```

Defined in: [async-queuer/createAsyncQueuer.ts:25](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/async-queuer/createAsyncQueuer.ts#L25)

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [async-queuer/createAsyncQueuer.ts:27](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/async-queuer/createAsyncQueuer.ts#L27)

#### Parameters

##### options

`Partial`\<[`AlpineAsyncQueuerOptions`](AlpineAsyncQueuerOptions.md)\<`TValue`, `TSelected`\>\>

#### Returns

`void`

***

### state

```ts
readonly state: Readonly<TSelected>;
```

Defined in: [async-queuer/createAsyncQueuer.ts:33](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/async-queuer/createAsyncQueuer.ts#L33)

Selected state. Pass a selector to opt in; the default selection is an empty object.

***

### subscribe

```ts
subscribe: AlpinePacerSubscribe<AsyncQueuerState<TValue>>;
```

Defined in: [async-queuer/createAsyncQueuer.ts:31](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/async-queuer/createAsyncQueuer.ts#L31)

Subscribes a child owner to selected state with automatic cleanup.
