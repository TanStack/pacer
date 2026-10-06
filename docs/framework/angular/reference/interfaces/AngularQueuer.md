---
id: AngularQueuer
title: AngularQueuer
---

Defined in: [queuer/injectQueuer.ts:29](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/queuer/injectQueuer.ts#L29)

## Extends

- `Pick`\<`Queuer`\<`TValue`\>,
  \| `"addItem"`
  \| `"getNextItem"`
  \| `"execute"`
  \| `"flush"`
  \| `"flushAsBatch"`
  \| `"peekNextItem"`
  \| `"peekAllItems"`
  \| `"start"`
  \| `"stop"`
  \| `"clear"`
  \| `"reset"`\>

## Type Parameters

### TValue

`TValue`

### TSelected

`TSelected` = \{
\}

## Properties

### fn

```ts
readonly fn: Signal<(item) => void>;
```

Defined in: [queuer/injectQueuer.ts:44](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/queuer/injectQueuer.ts#L44)

***

### key

```ts
readonly key: Signal<string | undefined>;
```

Defined in: [queuer/injectQueuer.ts:43](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/queuer/injectQueuer.ts#L43)

***

### options

```ts
readonly options: Signal<QueuerOptions<TValue> & AngularQueuerOptions<TValue, TSelected>>;
```

Defined in: [queuer/injectQueuer.ts:45](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/queuer/injectQueuer.ts#L45)

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [queuer/injectQueuer.ts:51](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/queuer/injectQueuer.ts#L51)

#### Parameters

##### options

`Partial`\<[`AngularQueuerOptions`](AngularQueuerOptions.md)\<`TValue`, `TSelected`\>\>

#### Returns

`void`

***

### state

```ts
readonly state: Signal<Readonly<TSelected>>;
```

Defined in: [queuer/injectQueuer.ts:50](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/queuer/injectQueuer.ts#L50)

***

### store

```ts
readonly store: Signal<Store<Readonly<QueuerState<TValue>>, never>>;
```

Defined in: [queuer/injectQueuer.ts:49](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/queuer/injectQueuer.ts#L49)

Core store access; use state() for reactive selected state.
