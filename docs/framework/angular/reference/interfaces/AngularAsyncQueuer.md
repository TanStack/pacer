---
id: AngularAsyncQueuer
title: AngularAsyncQueuer
---

Defined in: [async-queuer/injectAsyncQueuer.ts:26](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/async-queuer/injectAsyncQueuer.ts#L26)

## Extends

- `Omit`\<`AsyncQueuer`\<`TValue`\>, `"store"` \| `"options"` \| `"setOptions"`\>

## Type Parameters

### TValue

`TValue`

### TSelected

`TSelected` = \{
\}

## Properties

### options

```ts
options: AsyncQueuerOptions<TValue> & AngularAsyncQueuerOptions<TValue, TSelected>;
```

Defined in: [async-queuer/injectAsyncQueuer.ts:30](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/async-queuer/injectAsyncQueuer.ts#L30)

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [async-queuer/injectAsyncQueuer.ts:32](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/async-queuer/injectAsyncQueuer.ts#L32)

#### Parameters

##### options

`Partial`\<[`AngularAsyncQueuerOptions`](AngularAsyncQueuerOptions.md)\<`TValue`, `TSelected`\>\>

#### Returns

`void`

***

### state

```ts
readonly state: Signal<Readonly<TSelected>>;
```

Defined in: [async-queuer/injectAsyncQueuer.ts:40](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/async-queuer/injectAsyncQueuer.ts#L40)

Reactive state signal that will be updated when the async queuer state changes

Use this instead of `queuer.store.state`

***

### ~~store~~

```ts
readonly store: Store<Readonly<AsyncQueuerState<TValue>>>;
```

Defined in: [async-queuer/injectAsyncQueuer.ts:45](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/async-queuer/injectAsyncQueuer.ts#L45)

#### Deprecated

Use `queuer.state` instead of `queuer.store.state` if you want to read reactive state.
The state on the store object is not reactive in Angular signals.
