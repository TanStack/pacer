---
id: LitQueuer
title: LitQueuer
---

Defined in: [queuer/createQueuer.ts:19](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/queuer/createQueuer.ts#L19)

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

Defined in: [queuer/createQueuer.ts:23](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/queuer/createQueuer.ts#L23)

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [queuer/createQueuer.ts:24](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/queuer/createQueuer.ts#L24)

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

Defined in: [queuer/createQueuer.ts:28](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/queuer/createQueuer.ts#L28)

Selected state. Pass a selector to opt in; the default selection is an empty object.

***

### subscribe

```ts
subscribe: LitPacerSubscribe<QueuerState<TValue>>;
```

Defined in: [queuer/createQueuer.ts:26](https://github.com/TanStack/pacer/blob/main/packages/lit-pacer/src/queuer/createQueuer.ts#L26)

Subscribes a child owner to selected state with automatic cleanup.
