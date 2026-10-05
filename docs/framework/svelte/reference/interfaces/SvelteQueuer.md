---
id: SvelteQueuer
title: SvelteQueuer
---

Defined in: [packages/svelte-pacer/src/queuer/createQueuer.ts:18](https://github.com/TanStack/pacer/blob/main/packages/svelte-pacer/src/queuer/createQueuer.ts#L18)

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

Defined in: [packages/svelte-pacer/src/queuer/createQueuer.ts:22](https://github.com/TanStack/pacer/blob/main/packages/svelte-pacer/src/queuer/createQueuer.ts#L22)

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [packages/svelte-pacer/src/queuer/createQueuer.ts:23](https://github.com/TanStack/pacer/blob/main/packages/svelte-pacer/src/queuer/createQueuer.ts#L23)

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

Defined in: [packages/svelte-pacer/src/queuer/createQueuer.ts:27](https://github.com/TanStack/pacer/blob/main/packages/svelte-pacer/src/queuer/createQueuer.ts#L27)

Selected state. Pass a selector to opt in; the default selection is an empty object.

***

### Subscribe

```ts
Subscribe: SveltePacerSubscribe<QueuerState<TValue>>;
```

Defined in: [packages/svelte-pacer/src/queuer/createQueuer.ts:25](https://github.com/TanStack/pacer/blob/main/packages/svelte-pacer/src/queuer/createQueuer.ts#L25)

Subscribes a child snippet to state without updating the utility owner.
