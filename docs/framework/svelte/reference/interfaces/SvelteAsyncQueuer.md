---
id: SvelteAsyncQueuer
title: SvelteAsyncQueuer
---

Defined in: [packages/svelte-pacer/src/async-queuer/createAsyncQueuer.ts:20](https://github.com/TanStack/pacer/blob/main/packages/svelte-pacer/src/async-queuer/createAsyncQueuer.ts#L20)

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
options: AsyncQueuerOptions<TValue> & SvelteAsyncQueuerOptions<TValue, TSelected>;
```

Defined in: [packages/svelte-pacer/src/async-queuer/createAsyncQueuer.ts:24](https://github.com/TanStack/pacer/blob/main/packages/svelte-pacer/src/async-queuer/createAsyncQueuer.ts#L24)

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [packages/svelte-pacer/src/async-queuer/createAsyncQueuer.ts:26](https://github.com/TanStack/pacer/blob/main/packages/svelte-pacer/src/async-queuer/createAsyncQueuer.ts#L26)

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

Defined in: [packages/svelte-pacer/src/async-queuer/createAsyncQueuer.ts:30](https://github.com/TanStack/pacer/blob/main/packages/svelte-pacer/src/async-queuer/createAsyncQueuer.ts#L30)

Selected state. Pass a selector to opt in; the default selection is an empty object.
