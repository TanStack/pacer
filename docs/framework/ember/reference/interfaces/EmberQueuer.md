---
id: EmberQueuer
title: EmberQueuer
---

Defined in: [packages/ember-pacer/src/queuer/useQueuer.ts:22](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/queuer/useQueuer.ts#L22)

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
options: QueuerOptions<TValue> & EmberQueuerOptions<TValue, TSelected>;
```

Defined in: [packages/ember-pacer/src/queuer/useQueuer.ts:26](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/queuer/useQueuer.ts#L26)

***

### setOptions

```ts
setOptions: (options) => void;
```

Defined in: [packages/ember-pacer/src/queuer/useQueuer.ts:27](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/queuer/useQueuer.ts#L27)

#### Parameters

##### options

`Partial`\<[`EmberQueuerOptions`](EmberQueuerOptions.md)\<`TValue`, `TSelected`\>\>

#### Returns

`void`

***

### state

```ts
readonly state: Readonly<TSelected>;
```

Defined in: [packages/ember-pacer/src/queuer/useQueuer.ts:29](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/queuer/useQueuer.ts#L29)

Selected state. Pass a selector to opt in; the default selection is an empty object.
