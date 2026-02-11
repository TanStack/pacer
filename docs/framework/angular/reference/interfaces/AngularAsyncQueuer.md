---
id: AngularAsyncQueuer
title: AngularAsyncQueuer
---

# Interface: AngularAsyncQueuer\<TValue, TSelected\>

Defined in: [angular-pacer/src/async-queuer/injectAsyncQueuer.ts:11](https://github.com/theVedanta/pacer/blob/main/packages/angular-pacer/src/async-queuer/injectAsyncQueuer.ts#L11)

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

Defined in: [angular-pacer/src/async-queuer/injectAsyncQueuer.ts:20](https://github.com/theVedanta/pacer/blob/main/packages/angular-pacer/src/async-queuer/injectAsyncQueuer.ts#L20)

Reactive state signal that will be updated when the async queuer state changes

Use this instead of `queuer.store.state`

***

### ~~store~~

```ts
readonly store: Store<Readonly<AsyncQueuerState<TValue>>>;
```

Defined in: [angular-pacer/src/async-queuer/injectAsyncQueuer.ts:25](https://github.com/theVedanta/pacer/blob/main/packages/angular-pacer/src/async-queuer/injectAsyncQueuer.ts#L25)

#### Deprecated

Use `queuer.state` instead of `queuer.store.state` if you want to read reactive state.
The state on the store object is not reactive in Angular signals.
