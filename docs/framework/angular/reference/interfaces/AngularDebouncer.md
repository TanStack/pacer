---
id: AngularDebouncer
title: AngularDebouncer
---

Defined in: [debouncer/injectDebouncer.ts:34](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/debouncer/injectDebouncer.ts#L34)

## Extends

- `Pick`\<`Debouncer`\<`TFn`\>, `"maybeExecute"` \| `"flush"` \| `"cancel"` \| `"reset"` \| `"getIsScheduled"`\>

## Type Parameters

### TFn

`TFn` *extends* `AnyFunction`

### TSelected

`TSelected` = \{
\}

## Properties

### fn

```ts
readonly fn: Signal<TFn>;
```

Defined in: [debouncer/injectDebouncer.ts:42](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/debouncer/injectDebouncer.ts#L42)

***

### key

```ts
readonly key: Signal<string | undefined>;
```

Defined in: [debouncer/injectDebouncer.ts:41](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/debouncer/injectDebouncer.ts#L41)

***

### options

```ts
readonly options: Signal<DebouncerOptions<TFn> & AngularDebouncerOptions<TFn, TSelected>>;
```

Defined in: [debouncer/injectDebouncer.ts:43](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/debouncer/injectDebouncer.ts#L43)

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [debouncer/injectDebouncer.ts:49](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/debouncer/injectDebouncer.ts#L49)

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

Defined in: [debouncer/injectDebouncer.ts:48](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/debouncer/injectDebouncer.ts#L48)

***

### store

```ts
readonly store: Signal<Store<Readonly<DebouncerState<TFn>>, never>>;
```

Defined in: [debouncer/injectDebouncer.ts:47](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/debouncer/injectDebouncer.ts#L47)

Core store access; use state() for reactive selected state.
