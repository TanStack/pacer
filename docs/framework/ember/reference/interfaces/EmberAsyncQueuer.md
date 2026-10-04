---
id: EmberAsyncQueuer
title: EmberAsyncQueuer
---

Defined in: [packages/ember-pacer/src/async-queuer/useAsyncQueuer.ts:25](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/async-queuer/useAsyncQueuer.ts#L25)

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
options: AsyncQueuerOptions<TValue> & EmberAsyncQueuerOptions<TValue, TSelected>;
```

Defined in: [packages/ember-pacer/src/async-queuer/useAsyncQueuer.ts:29](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/async-queuer/useAsyncQueuer.ts#L29)

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [packages/ember-pacer/src/async-queuer/useAsyncQueuer.ts:31](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/async-queuer/useAsyncQueuer.ts#L31)

#### Parameters

##### options

`Partial`\<[`EmberAsyncQueuerOptions`](EmberAsyncQueuerOptions.md)\<`TValue`, `TSelected`\>\>

#### Returns

`void`

***

### state

```ts
readonly state: Readonly<TSelected>;
```

Defined in: [packages/ember-pacer/src/async-queuer/useAsyncQueuer.ts:35](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/async-queuer/useAsyncQueuer.ts#L35)

Selected state. Pass a selector to opt in; the default selection is an empty object.
