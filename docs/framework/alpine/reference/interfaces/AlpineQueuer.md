---
id: AlpineQueuer
title: AlpineQueuer
---

Defined in: [queuer/createQueuer.ts:18](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/queuer/createQueuer.ts#L18)

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
options: QueuerOptions<TValue> & AlpineQueuerOptions<TValue, TSelected>;
```

Defined in: [queuer/createQueuer.ts:22](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/queuer/createQueuer.ts#L22)

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [queuer/createQueuer.ts:23](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/queuer/createQueuer.ts#L23)

#### Parameters

##### options

`Partial`\<[`AlpineQueuerOptions`](AlpineQueuerOptions.md)\<`TValue`, `TSelected`\>\>

#### Returns

`void`

***

### state

```ts
readonly state: Readonly<TSelected>;
```

Defined in: [queuer/createQueuer.ts:27](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/queuer/createQueuer.ts#L27)

Selected state. Pass a selector to opt in; the default selection is an empty object.

***

### subscribe

```ts
subscribe: AlpinePacerSubscribe<QueuerState<TValue>>;
```

Defined in: [queuer/createQueuer.ts:25](https://github.com/TanStack/pacer/blob/main/packages/alpine-pacer/src/queuer/createQueuer.ts#L25)

Subscribes a child owner to selected state with automatic cleanup.
