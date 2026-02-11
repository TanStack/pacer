---
id: AngularAsyncBatcher
title: AngularAsyncBatcher
---

# Interface: AngularAsyncBatcher\<TValue, TSelected\>

Defined in: [angular-pacer/src/async-batcher/injectAsyncBatcher.ts:11](https://github.com/theVedanta/pacer/blob/main/packages/angular-pacer/src/async-batcher/injectAsyncBatcher.ts#L11)

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

Defined in: [angular-pacer/src/async-batcher/injectAsyncBatcher.ts:20](https://github.com/theVedanta/pacer/blob/main/packages/angular-pacer/src/async-batcher/injectAsyncBatcher.ts#L20)

Reactive state signal that will be updated when the async batcher state changes

Use this instead of `batcher.store.state`

***

### ~~store~~

```ts
readonly store: Store<Readonly<AsyncBatcherState<TValue>>>;
```

Defined in: [angular-pacer/src/async-batcher/injectAsyncBatcher.ts:25](https://github.com/theVedanta/pacer/blob/main/packages/angular-pacer/src/async-batcher/injectAsyncBatcher.ts#L25)

#### Deprecated

Use `batcher.state` instead of `batcher.store.state` if you want to read reactive state.
The state on the store object is not reactive in Angular signals.
