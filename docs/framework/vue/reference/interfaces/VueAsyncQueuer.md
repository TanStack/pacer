---
id: VueAsyncQueuer
title: VueAsyncQueuer
---

Defined in: [async-queuer/useAsyncQueuer.ts:22](https://github.com/TanStack/pacer/blob/main/packages/vue-pacer/src/async-queuer/useAsyncQueuer.ts#L22)

An AsyncQueuer with framework-reactive selected state. All core methods remain available.

## Extends

- `Omit`\<`AsyncQueuer`\<`TValue`\>, `"options"` \| `"setOptions"`\>

## Type Parameters

### TValue

`TValue`

### TSelected

`TSelected` = \{
\}

## Properties

### options

```ts
options: AsyncQueuerOptions<TValue> & VueAsyncQueuerOptions<TValue, TSelected>;
```

Defined in: [async-queuer/useAsyncQueuer.ts:26](https://github.com/TanStack/pacer/blob/main/packages/vue-pacer/src/async-queuer/useAsyncQueuer.ts#L26)

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [async-queuer/useAsyncQueuer.ts:28](https://github.com/TanStack/pacer/blob/main/packages/vue-pacer/src/async-queuer/useAsyncQueuer.ts#L28)

#### Parameters

##### options

`Partial`\<[`VueAsyncQueuerOptions`](VueAsyncQueuerOptions.md)\<`TValue`, `TSelected`\>\>

#### Returns

`void`

***

### state

```ts
readonly state: Readonly<ShallowRef<TSelected>>;
```

Defined in: [async-queuer/useAsyncQueuer.ts:34](https://github.com/TanStack/pacer/blob/main/packages/vue-pacer/src/async-queuer/useAsyncQueuer.ts#L34)

Selected state. Pass a selector to opt in; the default selection is an empty object.

***

### Subscribe

```ts
Subscribe: VuePacerSubscribe<AsyncQueuerState<TValue>>;
```

Defined in: [async-queuer/useAsyncQueuer.ts:32](https://github.com/TanStack/pacer/blob/main/packages/vue-pacer/src/async-queuer/useAsyncQueuer.ts#L32)

Subscribes a scoped slot to state without re-rendering the utility owner.
