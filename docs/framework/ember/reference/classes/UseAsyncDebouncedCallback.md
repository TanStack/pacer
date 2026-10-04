---
id: UseAsyncDebouncedCallback
title: UseAsyncDebouncedCallback
---

Defined in: [packages/ember-pacer/src/async-debouncer/useAsyncDebouncedCallback.ts:18](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/async-debouncer/useAsyncDebouncedCallback.ts#L18)

Returns a asyncdebounced callback from an owned Ember helper. Named arguments update the same utility.

## Extends

- `default`\<\{
  `Args`: \{
     `Named`: [`EmberAsyncDebouncerOptions`](../interfaces/EmberAsyncDebouncerOptions.md)\<`TFn`, `TSelected`\>;
     `Positional`: \[`TFn`\] \| \[`TFn`, (`state`) => `TSelected`\];
  \};
  `Return`: [`EmberAsyncDebouncer`](../interfaces/EmberAsyncDebouncer.md)\<`TFn`, `TSelected`\>\[`"maybeExecute"`\];
\}\>

## Type Parameters

### TFn

`TFn` *extends* `AnyAsyncFunction`

### TSelected

`TSelected` = \{
\}

## Constructors

### Constructor

```ts
new UseAsyncDebouncedCallback<TFn, TSelected>(owner?): UseAsyncDebouncedCallback;
```

Defined in: node\_modules/.pnpm/ember-source@7.3.0\_@glimmer+component@2.1.1\_supports-color@7.2.0\_\_supports-color@7.2.0/node\_modules/ember-source/types/stable/@ember/object/index.d.ts:28

#### Parameters

##### owner?

`Owner`

#### Returns

`UseAsyncDebouncedCallback`

#### Inherited from

```ts
Helper<{
  Args: {
    Positional:
      | [fn: TFn]
      | [fn: TFn, selector: (state: AsyncDebouncerState<TFn>) => TSelected]
    Named: EmberAsyncDebouncerOptions<TFn, TSelected>
  }
  Return: EmberAsyncDebouncer<TFn, TSelected>['maybeExecute']
}>.constructor
```

## Methods

### compute()

```ts
compute(positional, options): (...args) => Promise<Awaited<ReturnType<TFn>> | undefined>;
```

Defined in: [packages/ember-pacer/src/async-debouncer/useAsyncDebouncedCallback.ts:38](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/async-debouncer/useAsyncDebouncedCallback.ts#L38)

Override this function when writing a class-based helper.

#### Parameters

##### positional

\[`TFn`, (`state`) => `TSelected`\]

The positional arguments to the helper

##### options

[`EmberAsyncDebouncerOptions`](../interfaces/EmberAsyncDebouncerOptions.md)\<`TFn`, `TSelected`\>

#### Returns

```ts
(...args): Promise<Awaited<ReturnType<TFn>> | undefined>;
```

Attempts to execute the debounced function.
If a call is already in progress, it will be queued.

Error Handling:
- If the debounced function throws and no `onError` handler is configured,
  the error will be thrown from this method.
- If an `onError` handler is configured, errors will be caught and passed to the handler,
  and this method will return undefined.
- The error state can be checked using `getErrorCount()` and `getIsExecuting()`.

##### Parameters

###### args

...`Parameters`\<`TFn`\>

##### Returns

`Promise`\<`Awaited`\<`ReturnType`\<`TFn`\>\> \| `undefined`\>

A promise that resolves with the function's return value, or undefined if an error occurred and was handled by onError

##### Throws

The error from the debounced function if no onError handler is configured

#### Method

compute

#### Since

1.13.0

#### Overrides

```ts
Helper.compute
```
