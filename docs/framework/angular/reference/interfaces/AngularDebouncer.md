---
id: AngularDebouncer
title: AngularDebouncer
---

Defined in: [debouncer/injectDebouncer.ts:33](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/debouncer/injectDebouncer.ts#L33)

## Extends

- `Pick`\<`Debouncer`\<`TFn`\>, `"maybeExecute"` \| `"flush"` \| `"cancel"` \| `"reset"`\>

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

Defined in: [debouncer/injectDebouncer.ts:38](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/debouncer/injectDebouncer.ts#L38)

***

### key

```ts
readonly key: Signal<string | undefined>;
```

Defined in: [debouncer/injectDebouncer.ts:37](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/debouncer/injectDebouncer.ts#L37)

***

### options

```ts
readonly options: Signal<DebouncerOptions<TFn> & AngularDebouncerOptions<TFn, TSelected>>;
```

Defined in: [debouncer/injectDebouncer.ts:39](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/debouncer/injectDebouncer.ts#L39)

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [debouncer/injectDebouncer.ts:45](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/debouncer/injectDebouncer.ts#L45)

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

Defined in: [debouncer/injectDebouncer.ts:44](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/debouncer/injectDebouncer.ts#L44)

***

### store

```ts
readonly store: Signal<Store<Readonly<DebouncerState<TFn>>, never>>;
```

Defined in: [debouncer/injectDebouncer.ts:43](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/debouncer/injectDebouncer.ts#L43)

Core store access; use state() for reactive selected state.
