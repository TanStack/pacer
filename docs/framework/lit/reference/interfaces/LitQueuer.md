---
id: LitQueuer
title: LitQueuer
---

Defined in: [queuer/createQueuer.ts:18](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/queuer/createQueuer.ts#L18)

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
options: QueuerOptions<TValue> & LitQueuerOptions<TValue, TSelected>;
```

Defined in: [queuer/createQueuer.ts:22](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/queuer/createQueuer.ts#L22)

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [queuer/createQueuer.ts:23](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/queuer/createQueuer.ts#L23)

#### Parameters

##### options

`Partial`\<[`LitQueuerOptions`](LitQueuerOptions.md)\<`TValue`, `TSelected`\>\>

#### Returns

`void`

***

### state

```ts
readonly state: Readonly<TSelected>;
```

Defined in: [queuer/createQueuer.ts:25](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/queuer/createQueuer.ts#L25)

Selected state. Pass a selector to opt in; the default selection is an empty object.
