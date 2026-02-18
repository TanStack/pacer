---
id: AngularBatcher
title: AngularBatcher
---

# Interface: AngularBatcher\<TValue, TSelected\>

Defined in: [angular-pacer/src/batcher/injectBatcher.ts:20](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/batcher/injectBatcher.ts#L20)

## Extends

- `Omit`\<`Batcher`\<`TValue`\>, `"store"`\>

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

Defined in: [angular-pacer/src/batcher/injectBatcher.ts:29](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/batcher/injectBatcher.ts#L29)

Reactive state signal that will be updated when the batcher state changes

Use this instead of `batcher.store.state`

***

### ~~store~~

```ts
readonly store: Store<Readonly<BatcherState<TValue>>>;
```

Defined in: [angular-pacer/src/batcher/injectBatcher.ts:34](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/batcher/injectBatcher.ts#L34)

#### Deprecated

Use `batcher.state` instead of `batcher.store.state` if you want to read reactive state.
The state on the store object is not reactive in Angular signals.
