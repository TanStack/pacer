---
id: AngularQueuer
title: AngularQueuer
---

# Interface: AngularQueuer\<TValue, TSelected\>

Defined in: [queuer/injectQueuer.ts:20](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/queuer/injectQueuer.ts#L20)

## Extends

- `Omit`\<`Queuer`\<`TValue`\>, `"store"`\>

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

Defined in: [queuer/injectQueuer.ts:29](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/queuer/injectQueuer.ts#L29)

Reactive state signal that will be updated when the queuer state changes

Use this instead of `queuer.store.state`

***

### ~~store~~

```ts
readonly store: Store<Readonly<QueuerState<TValue>>>;
```

Defined in: [queuer/injectQueuer.ts:34](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/queuer/injectQueuer.ts#L34)

#### Deprecated

Use `queuer.state` instead of `queuer.store.state` if you want to read reactive state.
The state on the store object is not reactive in Angular signals.
