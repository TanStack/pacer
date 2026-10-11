---
id: AngularDebouncer
title: AngularDebouncer
---

Defined in: [debouncer/injectDebouncer.ts:26](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/debouncer/injectDebouncer.ts#L26)

## Extends

- `Omit`\<`Debouncer`\<`TFn`\>, `"store"` \| `"options"` \| `"setOptions"`\>

## Type Parameters

### TFn

`TFn` *extends* `AnyFunction`

### TSelected

`TSelected` = \{
\}

## Properties

### options

```ts
options: DebouncerOptions<TFn> & AngularDebouncerOptions<TFn, TSelected>;
```

Defined in: [debouncer/injectDebouncer.ts:30](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/debouncer/injectDebouncer.ts#L30)

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [debouncer/injectDebouncer.ts:31](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/debouncer/injectDebouncer.ts#L31)

#### Parameters

##### options

`Partial`\<[`AngularDebouncerOptions`](AngularDebouncerOptions.md)\<`TFn`, `TSelected`\>\>

#### Returns

`void`

***

### state

```ts
readonly state: Signal<Readonly<TSelected>>;
```

Defined in: [debouncer/injectDebouncer.ts:39](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/debouncer/injectDebouncer.ts#L39)

Reactive state signal that will be updated when the debouncer state changes

Use this instead of `debouncer.store.state`

***

### ~~store~~

```ts
readonly store: Store<Readonly<DebouncerState<TFn>>>;
```

Defined in: [debouncer/injectDebouncer.ts:44](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/debouncer/injectDebouncer.ts#L44)

#### Deprecated

Use `debouncer.state` instead of `debouncer.store.state` if you want to read reactive state.
The state on the store object is not reactive in Angular signals.
