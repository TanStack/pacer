---
id: SolidAsyncThrottler
title: SolidAsyncThrottler
---

# Interface: SolidAsyncThrottler\<TFn, TSelected\>

Defined in: [solid-pacer/src/async-throttler/createAsyncThrottler.ts:24](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/async-throttler/createAsyncThrottler.ts#L24)

## Extends

- `Omit`\<`AsyncThrottler`\<`TFn`\>, `"store"`\>

## Type Parameters

### TFn

`TFn` *extends* `AnyAsyncFunction`

### TSelected

`TSelected` = \{
\}

## Properties

### state

```ts
readonly state: Accessor<Readonly<TSelected>>;
```

Defined in: [solid-pacer/src/async-throttler/createAsyncThrottler.ts:50](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/async-throttler/createAsyncThrottler.ts#L50)

Reactive state that will be updated when the throttler state changes

Use this instead of `throttler.store.state`

***

### ~~store~~

```ts
readonly store: Store<Readonly<AsyncThrottlerState<TFn>>>;
```

Defined in: [solid-pacer/src/async-throttler/createAsyncThrottler.ts:56](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/async-throttler/createAsyncThrottler.ts#L56)

#### Deprecated

Use `throttler.state` instead of `throttler.store.state` if you want to read reactive state.
The state on the store object is not reactive, as it has not been wrapped in a `useStore` hook internally.
Although, you can make the state reactive by using the `useStore` in your own usage.

***

### Subscribe()

```ts
Subscribe: <TSelected>(props) => Element;
```

Defined in: [solid-pacer/src/async-throttler/createAsyncThrottler.ts:41](https://github.com/TanStack/pacer/blob/main/packages/solid-pacer/src/async-throttler/createAsyncThrottler.ts#L41)

A Solid component that allows you to subscribe to the throttler state.

This is useful for tracking specific parts of the throttler state
deep in your component tree without needing to pass a selector to the hook.

#### Type Parameters

##### TSelected

`TSelected`

#### Parameters

##### props

###### children

`Element` \| (`state`) => `Element`

###### selector

(`state`) => `TSelected`

#### Returns

`Element`

#### Example

```ts
<throttler.Subscribe selector={(state) => ({ isPending: state.isPending, isExecuting: state.isExecuting })}>
  {(state) => (
    <div>{state().isPending ? 'Pending...' : state().isExecuting ? 'Executing...' : 'Ready'}</div>
  )}
</throttler.Subscribe>
```
