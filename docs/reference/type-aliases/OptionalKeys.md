---
id: OptionalKeys
title: OptionalKeys
---

# Type Alias: OptionalKeys\<T, TKey\>

```ts
type OptionalKeys<T, TKey> = Omit<T, TKey> & Partial<Pick<T, TKey>>;
```

Defined in: [types.ts:11](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/types.ts#L11)

## Type Parameters

### T

`T`

### TKey

`TKey` *extends* keyof `T`
