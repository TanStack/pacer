---
id: OctaneQueuer
title: OctaneQueuer
---

Defined in: [queuer/useQueuer.ts:19](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/queuer/useQueuer.ts#L19)

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
options: QueuerOptions<TValue> & OctaneQueuerOptions<TValue, TSelected>;
```

Defined in: [queuer/useQueuer.ts:23](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/queuer/useQueuer.ts#L23)

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [queuer/useQueuer.ts:24](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/queuer/useQueuer.ts#L24)

#### Parameters

##### options

`Partial`\<[`OctaneQueuerOptions`](OctaneQueuerOptions.md)\<`TValue`, `TSelected`\>\>

#### Returns

`void`

***

### state

```ts
readonly state: Readonly<TSelected>;
```

Defined in: [queuer/useQueuer.ts:26](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/queuer/useQueuer.ts#L26)

Selected state. Pass a selector to opt in; the default selection is an empty object.
