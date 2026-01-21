---
id: AngularBatcher
title: AngularBatcher
---

# Interface: AngularBatcher\<TValue, TSelected\>

Defined in: [batcher/injectBatcher.ts:8](https://github.com/theVedanta/pacer/blob/main/packages/angular-pacer/src/batcher/injectBatcher.ts#L8)

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

Defined in: [batcher/injectBatcher.ts:17](https://github.com/theVedanta/pacer/blob/main/packages/angular-pacer/src/batcher/injectBatcher.ts#L17)

Reactive state signal that will be updated when the batcher state changes

Use this instead of `batcher.store.state`

***

### ~~store~~

```ts
readonly store: Store<Readonly<BatcherState<TValue>>>;
```

Defined in: [batcher/injectBatcher.ts:22](https://github.com/theVedanta/pacer/blob/main/packages/angular-pacer/src/batcher/injectBatcher.ts#L22)

#### Deprecated

Use `batcher.state` instead of `batcher.store.state` if you want to read reactive state.
The state on the store object is not reactive in Angular signals.
