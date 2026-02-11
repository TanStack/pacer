---
id: AngularQueuer
title: AngularQueuer
---

# Interface: AngularQueuer\<TValue, TSelected\>

Defined in: [angular-pacer/src/queuer/injectQueuer.ts:8](https://github.com/theVedanta/pacer/blob/main/packages/angular-pacer/src/queuer/injectQueuer.ts#L8)

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

Defined in: [angular-pacer/src/queuer/injectQueuer.ts:17](https://github.com/theVedanta/pacer/blob/main/packages/angular-pacer/src/queuer/injectQueuer.ts#L17)

Reactive state signal that will be updated when the queuer state changes

Use this instead of `queuer.store.state`

***

### ~~store~~

```ts
readonly store: Store<Readonly<QueuerState<TValue>>>;
```

Defined in: [angular-pacer/src/queuer/injectQueuer.ts:22](https://github.com/theVedanta/pacer/blob/main/packages/angular-pacer/src/queuer/injectQueuer.ts#L22)

#### Deprecated

Use `queuer.state` instead of `queuer.store.state` if you want to read reactive state.
The state on the store object is not reactive in Angular signals.
