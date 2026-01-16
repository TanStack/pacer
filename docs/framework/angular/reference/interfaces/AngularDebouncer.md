---
id: AngularDebouncer
title: AngularDebouncer
---

# Interface: AngularDebouncer\<TFn, TSelected\>

Defined in: [angular-pacer/src/debouncer/createDebouncer.ts:12](https://github.com/theVedanta/pacer/blob/main/packages/angular-pacer/src/debouncer/createDebouncer.ts#L12)

## Extends

- `Omit`\<`Debouncer`\<`TFn`\>, `"store"`\>

## Type Parameters

### TFn

`TFn` *extends* `AnyFunction`

### TSelected

`TSelected` = \{
\}

## Properties

### state

```ts
readonly state: Signal<Readonly<TSelected>>;
```

Defined in: [angular-pacer/src/debouncer/createDebouncer.ts:21](https://github.com/theVedanta/pacer/blob/main/packages/angular-pacer/src/debouncer/createDebouncer.ts#L21)

Reactive state signal that will be updated when the debouncer state changes

Use this instead of `debouncer.store.state`

***

### ~~store~~

```ts
readonly store: Store<Readonly<DebouncerState<TFn>>>;
```

Defined in: [angular-pacer/src/debouncer/createDebouncer.ts:26](https://github.com/theVedanta/pacer/blob/main/packages/angular-pacer/src/debouncer/createDebouncer.ts#L26)

#### Deprecated

Use `debouncer.state` instead of `debouncer.store.state` if you want to read reactive state.
The state on the store object is not reactive in Angular signals.
