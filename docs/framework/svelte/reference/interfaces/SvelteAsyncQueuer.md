---
id: SvelteAsyncQueuer
title: SvelteAsyncQueuer
---

Defined in: [packages/svelte-pacer/src/async-queuer/createAsyncQueuer.ts:21](https://github.com/TanStack/pacer/blob/main/packages/svelte-pacer/src/async-queuer/createAsyncQueuer.ts#L21)

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
options: AsyncQueuerOptions<TValue> & SvelteAsyncQueuerOptions<TValue, TSelected>;
```

Defined in: [packages/svelte-pacer/src/async-queuer/createAsyncQueuer.ts:25](https://github.com/TanStack/pacer/blob/main/packages/svelte-pacer/src/async-queuer/createAsyncQueuer.ts#L25)

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [packages/svelte-pacer/src/async-queuer/createAsyncQueuer.ts:27](https://github.com/TanStack/pacer/blob/main/packages/svelte-pacer/src/async-queuer/createAsyncQueuer.ts#L27)

#### Parameters

##### options

`Partial`\<[`SvelteAsyncQueuerOptions`](SvelteAsyncQueuerOptions.md)\<`TValue`, `TSelected`\>\>

#### Returns

`void`

***

### state

```ts
readonly state: Readonly<TSelected>;
```

Defined in: [packages/svelte-pacer/src/async-queuer/createAsyncQueuer.ts:33](https://github.com/TanStack/pacer/blob/main/packages/svelte-pacer/src/async-queuer/createAsyncQueuer.ts#L33)

Selected state. Pass a selector to opt in; the default selection is an empty object.

***

### Subscribe

```ts
Subscribe: SveltePacerSubscribe<AsyncQueuerState<TValue>>;
```

Defined in: [packages/svelte-pacer/src/async-queuer/createAsyncQueuer.ts:31](https://github.com/TanStack/pacer/blob/main/packages/svelte-pacer/src/async-queuer/createAsyncQueuer.ts#L31)

Subscribes a child snippet to state without updating the utility owner.
