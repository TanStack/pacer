---
id: UseAsyncRateLimitedCallback
title: UseAsyncRateLimitedCallback
---

Defined in: [packages/ember-pacer/src/async-rate-limiter/useAsyncRateLimitedCallback.ts:18](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/async-rate-limiter/useAsyncRateLimitedCallback.ts#L18)

Returns a asyncratelimited callback from an owned Ember helper. Named arguments update the same utility.

## Extends

- `default`\<\{
  `Args`: \{
     `Named`: [`EmberAsyncRateLimiterOptions`](../interfaces/EmberAsyncRateLimiterOptions.md)\<`TFn`, `TSelected`\>;
     `Positional`: \[`TFn`\] \| \[`TFn`, (`state`) => `TSelected`\];
  \};
  `Return`: [`EmberAsyncRateLimiter`](../interfaces/EmberAsyncRateLimiter.md)\<`TFn`, `TSelected`\>\[`"maybeExecute"`\];
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
new UseAsyncRateLimitedCallback<TFn, TSelected>(owner?): UseAsyncRateLimitedCallback;
```

Defined in: node\_modules/.pnpm/ember-source@7.3.0\_@glimmer+component@2.1.1\_supports-color@7.2.0\_\_supports-color@7.2.0/node\_modules/ember-source/types/stable/@ember/object/index.d.ts:28

#### Parameters

##### owner?

`Owner`

#### Returns

`UseAsyncRateLimitedCallback`

#### Inherited from

```ts
Helper<{
  Args: {
    Positional:
      | [fn: TFn]
      | [fn: TFn, selector: (state: AsyncRateLimiterState<TFn>) => TSelected]
    Named: EmberAsyncRateLimiterOptions<TFn, TSelected>
  }
  Return: EmberAsyncRateLimiter<TFn, TSelected>['maybeExecute']
}>.constructor
```

## Methods

### compute()

```ts
compute(positional, options): (...args) => Promise<Awaited<ReturnType<TFn>> | undefined>;
```

Defined in: [packages/ember-pacer/src/async-rate-limiter/useAsyncRateLimitedCallback.ts:38](https://github.com/TanStack/pacer/blob/main/packages/ember-pacer/src/async-rate-limiter/useAsyncRateLimitedCallback.ts#L38)

Override this function when writing a class-based helper.

#### Parameters

##### positional

\[`TFn`, (`state`) => `TSelected`\]

The positional arguments to the helper

##### options

[`EmberAsyncRateLimiterOptions`](../interfaces/EmberAsyncRateLimiterOptions.md)\<`TFn`, `TSelected`\>

#### Returns

```ts
(...args): Promise<Awaited<ReturnType<TFn>> | undefined>;
```

Attempts to execute the rate-limited function if within the configured limits.
Will reject execution if the number of calls in the current window exceeds the limit.

Error Handling:
- If the rate-limited function throws and no `onError` handler is configured,
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

The error from the rate-limited function if no onError handler is configured

##### Example

```ts
const rateLimiter = new AsyncRateLimiter(fn, { limit: 5, window: 1000 });

// First 5 calls will return a promise that resolves with the result
const result = await rateLimiter.maybeExecute('arg1', 'arg2');

// Additional calls within the window will return undefined
const result2 = await rateLimiter.maybeExecute('arg1', 'arg2'); // undefined
```

#### Method

compute

#### Since

1.13.0

#### Overrides

```ts
Helper.compute
```
