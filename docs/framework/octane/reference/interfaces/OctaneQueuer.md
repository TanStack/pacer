---
id: OctaneQueuer
title: OctaneQueuer
---

Defined in: [queuer/useQueuer.ts:21](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/queuer/useQueuer.ts#L21)

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

Defined in: [queuer/useQueuer.ts:25](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/queuer/useQueuer.ts#L25)

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [queuer/useQueuer.ts:26](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/queuer/useQueuer.ts#L26)

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

Defined in: [queuer/useQueuer.ts:30](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/queuer/useQueuer.ts#L30)

Selected state. Pass a selector to opt in; the default selection is an empty object.

***

### Subscribe

```ts
Subscribe: OctanePacerSubscribe<QueuerState<TValue>>;
```

Defined in: [queuer/useQueuer.ts:28](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/queuer/useQueuer.ts#L28)

Selects state in a child without subscribing the utility owner.
