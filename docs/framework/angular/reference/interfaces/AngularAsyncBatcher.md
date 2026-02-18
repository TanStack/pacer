---
id: AngularAsyncBatcher
title: AngularAsyncBatcher
---

# Interface: AngularAsyncBatcher\<TValue, TSelected\>

Defined in: [async-batcher/injectAsyncBatcher.ts:24](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/async-batcher/injectAsyncBatcher.ts#L24)

## Extends

- `Omit`\<`AsyncBatcher`\<`TValue`\>, `"store"`\>

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

Defined in: [async-batcher/injectAsyncBatcher.ts:33](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/async-batcher/injectAsyncBatcher.ts#L33)

Reactive state signal that will be updated when the async batcher state changes

Use this instead of `batcher.store.state`

***

### ~~store~~

```ts
readonly store: Store<Readonly<AsyncBatcherState<TValue>>>;
```

Defined in: [async-batcher/injectAsyncBatcher.ts:38](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/async-batcher/injectAsyncBatcher.ts#L38)

#### Deprecated

Use `batcher.state` instead of `batcher.store.state` if you want to read reactive state.
The state on the store object is not reactive in Angular signals.
