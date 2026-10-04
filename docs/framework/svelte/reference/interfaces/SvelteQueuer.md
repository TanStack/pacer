---
id: SvelteQueuer
title: SvelteQueuer
---

Defined in: [packages/svelte-pacer/src/queuer/createQueuer.ts:17](https://github.com/TanStack/pacer/blob/main/packages/svelte-pacer/src/queuer/createQueuer.ts#L17)

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
options: QueuerOptions<TValue> & SvelteQueuerOptions<TValue, TSelected>;
```

Defined in: [packages/svelte-pacer/src/queuer/createQueuer.ts:21](https://github.com/TanStack/pacer/blob/main/packages/svelte-pacer/src/queuer/createQueuer.ts#L21)

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [packages/svelte-pacer/src/queuer/createQueuer.ts:22](https://github.com/TanStack/pacer/blob/main/packages/svelte-pacer/src/queuer/createQueuer.ts#L22)

#### Parameters

##### options

`Partial`\<[`SvelteQueuerOptions`](SvelteQueuerOptions.md)\<`TValue`, `TSelected`\>\>

#### Returns

`void`

***

### state

```ts
readonly state: Readonly<TSelected>;
```

Defined in: [packages/svelte-pacer/src/queuer/createQueuer.ts:24](https://github.com/TanStack/pacer/blob/main/packages/svelte-pacer/src/queuer/createQueuer.ts#L24)

Selected state. Pass a selector to opt in; the default selection is an empty object.
