---
id: AngularAsyncQueuer
title: AngularAsyncQueuer
---

Defined in: [async-queuer/injectAsyncQueuer.ts:33](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/async-queuer/injectAsyncQueuer.ts#L33)

## Extends

- `Pick`\<`AsyncQueuer`\<`TValue`\>,
  \| `"addItem"`
  \| `"getNextItem"`
  \| `"execute"`
  \| `"flush"`
  \| `"flushAsBatch"`
  \| `"peekNextItem"`
  \| `"peekAllItems"`
  \| `"peekActiveItems"`
  \| `"peekPendingItems"`
  \| `"start"`
  \| `"stop"`
  \| `"clear"`
  \| `"getAbortSignal"`
  \| `"abort"`
  \| `"reset"`\>

## Type Parameters

### TValue

`TValue`

### TSelected

`TSelected` = \{
\}

## Properties

### asyncRetryers

```ts
readonly asyncRetryers: Signal<Map<number, AsyncRetryer<(item) => Promise<any>>>>;
```

Defined in: [async-queuer/injectAsyncQueuer.ts:63](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/async-queuer/injectAsyncQueuer.ts#L63)

***

### fn

```ts
readonly fn: Signal<(item) => Promise<any>>;
```

Defined in: [async-queuer/injectAsyncQueuer.ts:52](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/async-queuer/injectAsyncQueuer.ts#L52)

***

### key

```ts
readonly key: Signal<string | undefined>;
```

Defined in: [async-queuer/injectAsyncQueuer.ts:51](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/async-queuer/injectAsyncQueuer.ts#L51)

***

### options

```ts
readonly options: Signal<AsyncQueuerOptions<TValue> & AngularAsyncQueuerOptions<TValue, TSelected>>;
```

Defined in: [async-queuer/injectAsyncQueuer.ts:53](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/async-queuer/injectAsyncQueuer.ts#L53)

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [async-queuer/injectAsyncQueuer.ts:60](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/async-queuer/injectAsyncQueuer.ts#L60)

#### Parameters

##### options

`Partial`\<[`AngularAsyncQueuerOptions`](AngularAsyncQueuerOptions.md)\<`TValue`, `TSelected`\>\>

#### Returns

`void`

***

### state

```ts
readonly state: Signal<Readonly<TSelected>>;
```

Defined in: [async-queuer/injectAsyncQueuer.ts:59](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/async-queuer/injectAsyncQueuer.ts#L59)

***

### store

```ts
readonly store: Signal<Store<Readonly<AsyncQueuerState<TValue>>, never>>;
```

Defined in: [async-queuer/injectAsyncQueuer.ts:58](https://github.com/benjavicente/pacer/blob/main/packages/angular-pacer/src/async-queuer/injectAsyncQueuer.ts#L58)

Core store access; use state() for reactive selected state.
