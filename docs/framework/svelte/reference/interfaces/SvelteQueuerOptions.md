---
id: SvelteQueuerOptions
title: SvelteQueuerOptions
---

Defined in: [packages/svelte-pacer/src/queuer/createQueuer.ts:8](https://github.com/TanStack/pacer/blob/main/packages/svelte-pacer/src/queuer/createQueuer.ts#L8)

Options for createQueuer, including owner cleanup.

## Extends

- `QueuerOptions`\<`TValue`\>

## Type Parameters

### TValue

`TValue`

### TSelected

`TSelected` = \{
\}

## Properties

### onUnmount?

```ts
optional onUnmount?: (instance) => void;
```

Defined in: [packages/svelte-pacer/src/queuer/createQueuer.ts:13](https://github.com/TanStack/pacer/blob/main/packages/svelte-pacer/src/queuer/createQueuer.ts#L13)

Replaces default cleanup. Use this to flush, cancel, or stop pending work.

#### Parameters

##### instance

[`SvelteQueuer`](SvelteQueuer.md)\<`TValue`, `TSelected`\>

#### Returns

`void`
