---
id: VueQueuer
title: VueQueuer
---

Defined in: [queuer/useQueuer.ts:18](https://github.com/TanStack/pacer/blob/main/packages/vue-pacer/src/queuer/useQueuer.ts#L18)

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

Defined in: [queuer/useQueuer.ts:22](https://github.com/TanStack/pacer/blob/main/packages/vue-pacer/src/queuer/useQueuer.ts#L22)

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [queuer/useQueuer.ts:23](https://github.com/TanStack/pacer/blob/main/packages/vue-pacer/src/queuer/useQueuer.ts#L23)

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

Defined in: [queuer/useQueuer.ts:25](https://github.com/TanStack/pacer/blob/main/packages/vue-pacer/src/queuer/useQueuer.ts#L25)

Selected state. Pass a selector to opt in; the default selection is an empty object.
