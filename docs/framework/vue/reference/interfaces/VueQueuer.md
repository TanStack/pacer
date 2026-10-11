---
id: VueQueuer
title: VueQueuer
---

Defined in: [queuer/useQueuer.ts:19](https://github.com/TanStack/pacer/blob/main/packages/vue-pacer/src/queuer/useQueuer.ts#L19)

A Queuer with framework-reactive selected state. All core methods remain available.

## Extends

- `Omit`\<`Queuer`\<`TValue`\>, `"options"` \| `"setOptions"`\>

## Type Parameters

### TValue

`TValue`

### TSelected

`TSelected` = \{
\}

## Properties

### options

```ts
options: QueuerOptions<TValue> & VueQueuerOptions<TValue, TSelected>;
```

Defined in: [queuer/useQueuer.ts:23](https://github.com/TanStack/pacer/blob/main/packages/vue-pacer/src/queuer/useQueuer.ts#L23)

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [queuer/useQueuer.ts:24](https://github.com/TanStack/pacer/blob/main/packages/vue-pacer/src/queuer/useQueuer.ts#L24)

#### Parameters

##### options

`Partial`\<[`VueQueuerOptions`](VueQueuerOptions.md)\<`TValue`, `TSelected`\>\>

#### Returns

`void`

***

### state

```ts
readonly state: Readonly<ShallowRef<TSelected>>;
```

Defined in: [queuer/useQueuer.ts:28](https://github.com/TanStack/pacer/blob/main/packages/vue-pacer/src/queuer/useQueuer.ts#L28)

Selected state. Pass a selector to opt in; the default selection is an empty object.

***

### Subscribe

```ts
Subscribe: VuePacerSubscribe<QueuerState<TValue>>;
```

Defined in: [queuer/useQueuer.ts:26](https://github.com/TanStack/pacer/blob/main/packages/vue-pacer/src/queuer/useQueuer.ts#L26)

Subscribes a scoped slot to state without re-rendering the utility owner.
