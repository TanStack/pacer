---
id: OctaneAsyncQueuer
title: OctaneAsyncQueuer
---

Defined in: [async-queuer/useAsyncQueuer.ts:24](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/async-queuer/useAsyncQueuer.ts#L24)

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
options: AsyncQueuerOptions<TValue> & OctaneAsyncQueuerOptions<TValue, TSelected>;
```

Defined in: [async-queuer/useAsyncQueuer.ts:28](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/async-queuer/useAsyncQueuer.ts#L28)

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [async-queuer/useAsyncQueuer.ts:30](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/async-queuer/useAsyncQueuer.ts#L30)

#### Parameters

##### options

`Partial`\<[`OctaneAsyncQueuerOptions`](OctaneAsyncQueuerOptions.md)\<`TValue`, `TSelected`\>\>

#### Returns

`void`

***

### state

```ts
readonly state: Readonly<TSelected>;
```

Defined in: [async-queuer/useAsyncQueuer.ts:36](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/async-queuer/useAsyncQueuer.ts#L36)

Selected state. Pass a selector to opt in; the default selection is an empty object.

***

### Subscribe

```ts
Subscribe: OctanePacerSubscribe<AsyncQueuerState<TValue>>;
```

Defined in: [async-queuer/useAsyncQueuer.ts:34](https://github.com/TanStack/pacer/blob/main/packages/octane-pacer/src/async-queuer/useAsyncQueuer.ts#L34)

Selects state in a child without subscribing the utility owner.
