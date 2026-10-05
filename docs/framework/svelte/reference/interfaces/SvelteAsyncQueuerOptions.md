---
id: SvelteAsyncQueuerOptions
title: SvelteAsyncQueuerOptions
---

Defined in: [packages/svelte-pacer/src/async-queuer/createAsyncQueuer.ts:12](https://github.com/TanStack/pacer/blob/main/packages/svelte-pacer/src/async-queuer/createAsyncQueuer.ts#L12)

Options for createAsyncQueuer, including owner cleanup.

## Extends

- `AsyncQueuerOptions`\<`TValue`\>

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

Defined in: [packages/svelte-pacer/src/async-queuer/createAsyncQueuer.ts:17](https://github.com/TanStack/pacer/blob/main/packages/svelte-pacer/src/async-queuer/createAsyncQueuer.ts#L17)

Replaces default cleanup. Use this to flush, cancel, or stop pending work.

#### Parameters

##### instance

[`SvelteAsyncQueuer`](SvelteAsyncQueuer.md)\<`TValue`, `TSelected`\>

#### Returns

`void`
