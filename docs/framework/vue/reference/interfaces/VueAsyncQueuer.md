---
id: VueAsyncQueuer
title: VueAsyncQueuer
---

Defined in: [async-queuer/useAsyncQueuer.ts:21](https://github.com/TanStack/pacer/blob/main/packages/vue-pacer/src/async-queuer/useAsyncQueuer.ts#L21)

A AsyncQueuer with framework-reactive selected state. All core methods remain available.

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

Defined in: [async-queuer/useAsyncQueuer.ts:25](https://github.com/TanStack/pacer/blob/main/packages/vue-pacer/src/async-queuer/useAsyncQueuer.ts#L25)

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [async-queuer/useAsyncQueuer.ts:27](https://github.com/TanStack/pacer/blob/main/packages/vue-pacer/src/async-queuer/useAsyncQueuer.ts#L27)

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

Defined in: [async-queuer/useAsyncQueuer.ts:31](https://github.com/TanStack/pacer/blob/main/packages/vue-pacer/src/async-queuer/useAsyncQueuer.ts#L31)

Selected state. Pass a selector to opt in; the default selection is an empty object.
