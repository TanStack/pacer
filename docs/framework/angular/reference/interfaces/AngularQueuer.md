---
id: AngularQueuer
title: AngularQueuer
---

Defined in: [queuer/injectQueuer.ts:22](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/queuer/injectQueuer.ts#L22)

## Extends

- `Omit`\<`Queuer`\<`TValue`\>, `"store"` \| `"options"` \| `"setOptions"`\>

## Type Parameters

### TValue

`TValue`

### TSelected

`TSelected` = \{
\}

## Properties

### options

```ts
options: QueuerOptions<TValue> & AngularQueuerOptions<TValue, TSelected>;
```

Defined in: [queuer/injectQueuer.ts:26](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/queuer/injectQueuer.ts#L26)

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [queuer/injectQueuer.ts:27](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/queuer/injectQueuer.ts#L27)

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

Defined in: [queuer/injectQueuer.ts:35](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/queuer/injectQueuer.ts#L35)

Reactive state signal that will be updated when the queuer state changes

Use this instead of `queuer.store.state`

***

### ~~store~~

```ts
readonly store: Store<Readonly<QueuerState<TValue>>>;
```

Defined in: [queuer/injectQueuer.ts:40](https://github.com/TanStack/pacer/blob/main/packages/angular-pacer/src/queuer/injectQueuer.ts#L40)

#### Deprecated

Use `queuer.state` instead of `queuer.store.state` if you want to read reactive state.
The state on the store object is not reactive in Angular signals.
