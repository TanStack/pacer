---
id: AngularAsyncQueuer
title: AngularAsyncQueuer
---

# Interface: AngularAsyncQueuer\<TValue, TSelected\>

Defined in: [async-queuer/injectAsyncQueuer.ts:24](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/async-queuer/injectAsyncQueuer.ts#L24)

## Extends

- `Omit`\<`AsyncQueuer`\<`TValue`\>, `"store"`\>

## Type Parameters

### TValue

`TValue`

### TSelected

`TSelected` = \{
\}

## Properties

### state

```ts
readonly state: Signal<Readonly<TSelected>>;
```

Defined in: [async-queuer/injectAsyncQueuer.ts:33](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/async-queuer/injectAsyncQueuer.ts#L33)

Reactive state signal that will be updated when the async queuer state changes

Use this instead of `queuer.store.state`

***

### ~~store~~

```ts
readonly store: Store<Readonly<AsyncQueuerState<TValue>>>;
```

Defined in: [async-queuer/injectAsyncQueuer.ts:38](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/async-queuer/injectAsyncQueuer.ts#L38)

#### Deprecated

Use `queuer.state` instead of `queuer.store.state` if you want to read reactive state.
The state on the store object is not reactive in Angular signals.
