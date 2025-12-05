---
title: Which Pacer Utility Should I Choose?
id: which-pacer-utility-should-i-choose
---

TanStack Pacer provides 5 core utilities for controlling function execution frequency. Here is a one-sentence summary of each utility:

 - [**Debouncer**](./debouncing.md) - Executes a function after a period of inactivity. (Rejects other calls during activity)
 - [**Throttler**](./throttling.md) - Executes a function at regular intervals. (Rejects all but one call during each interval)
 - [**Rate Limiter**](./rate-limiting.md) - Prevents a function from being called too frequently. (Rejects calls when the limit is reached)
 - [**Queuer**](./queuing.md) - Processes all calls to a function in order. (Only rejects calls if the queue is full)
 - [**Batcher**](./batching.md) - Groups multiple function calls into a single batch. (No rejections)

After choosing which strategy fits your needs, there are additional variations and decisions to consider. This guide provides quick clarifications on the most common decisions you'll need to make.

## Synchronous vs Asynchronous

You may see both a [Debouncer](./debouncing.md) and an [Async Debouncer](./async-debouncing.md) when first exploring TanStack Pacer. Which one should you use?

Each utility comes in both synchronous and asynchronous versions. For most use cases, the simpler synchronous version is sufficient. However, if you need these utilities to handle async logic for you, the complexity of each utility increases significantly. The bundle size of the asynchronous versions of each utility is often more than double the size of the synchronous versions. If you actually need and use some of these additional APIs, the extra complexity is worth it, but don't choose the asynchronous version of a utility unless you actually end up using these features.

> [!TIP] We recommend using the simpler synchronous version of each utility for most use cases. (Debouncer, Throttler, Rate Limiter, Queuer, Batcher)

Luckily, switching between the synchronous and asynchronous versions of a utility is straightforward. For the most part, just replace the import whenever you decide you need to switch.

### When to Use the Asynchronous Version

Use the asynchronous version when you need any of these capabilities:

- **Await Return Values**: Await and use the return value from your function, rather than just calling it for side effects. The synchronous version returns void, while the async version returns a Promise that resolves with your function's result. You can also await the return value to determine when to send another execution when execution order matters.

- **Error Handling**: Built-in error handling with configurable error callbacks, control over whether errors are thrown or swallowed, and error statistics tracking.

- **Extra Callbacks**: Instead of just an `onExecute` callback that comes with the synchronous version, the asynchronous version comes with additional callbacks such as `onSuccess`, `onError`, `onSettled`, and `onAbort`.

- **Concurrency**: For queuing specifically, concurrency support allowing multiple items to be processed simultaneously while maintaining control over how many run at once.

- **Retries and Aborts**: Built-in integration with `AsyncRetryer` for automatic retries of failed executions with configurable backoff strategies, jitter, and retry limits. Cancel in-flight operations using AbortController.

## Pacer Lite vs Pacer

Pacer Lite (`@tanstack/pacer-lite`) is a stripped-down version of the core TanStack Pacer library. It is designed to be used in libraries and npm packages that need minimal overhead and no reactivity features. The Lite version of each utility has the same core functionality as its core counterpart, but with a smaller API surface and a smaller bundle size. Pacer Lite lacks reactivity features, framework adapters, devtools support, and some of the advanced options that the core utilities have.

If you are building an application, use the normal `@tanstack/pacer` package (or your framework adapter like `@tanstack/react-pacer` for React, `@tanstack/solid-pacer` for Solid, etc.). Only use Pacer Lite if you are building a library or npm package that needs to be as lightweight as possible and doesn't need the extra features of the core utilities.

## Which Hook Variation Should I Use?

We will use the Debouncer utility as the main example, but the same principles apply to all the other utilities.

If you are using a framework adapter like React, you will see that there are lots of examples with multiple hook variations. For example, for debouncing you will see:

- [`useDebouncer`](../framework/react/examples/useDebouncer)
- [`useDebouncedCallback`](../framework/react/examples/useDebouncedCallback)
- [`useDebouncedState`](../framework/react/examples/useDebouncedState)
- [`useDebouncedValue`](../framework/react/examples/useDebouncedValue)

You will also probably see that you can use the core `Debouncer` class directly or the core `debounce` function directly without using a hook.

These are all variations of the same basic debouncing functionality. So, which one should you use?

The answer is: It Depends! 🤷‍♂️

But also: It doesn't really matter too much. They all do essentially the same thing. It's mostly a matter of personal preference and how you want to interact with the utility. Under the hood, a `Debouncer` instance is created no matter what you choose.

You can start with the [`useDebouncer`](../framework/react/examples/useDebouncer) hook if you don't know which one to use. All of the others wrap the `useDebouncer` hook with different argument and return value signatures.

```tsx
import { useDebouncer } from '@tanstack/react-pacer'
//...
const debouncer = useDebouncer(fn, options)

debouncer.maybeExecute(args) // execute the debounced function
//...
debouncer.cancel() // use Debouncer APIs with full access to the debouncer instance
debouncer.flush()
```

If you only need to create a debounced function and don't need access to the debouncer instance to call methods or use its extra features, use the [`useDebouncedCallback`](../framework/react/examples/useDebouncedCallback) hook. The `*Callback` versions of the hooks are actually most similar to calling the core functions directly (like `debounce`) but with the memoization setup taken care of for you.

```tsx
import { useDebouncedCallback } from '@tanstack/react-pacer'
//...
const debouncedFn = useDebouncedCallback(fn, options)

debouncedFn(args) // execute the debounced function
//...
```

The other variations are convenience hooks that wrap the `useDebouncer` hook with different argument and return value signatures. For example, the [`useDebouncedState`](../framework/react/examples/useDebouncedState) hook is useful when you need to debounce a state value.

```tsx
import { useDebouncedState } from '@tanstack/react-pacer'
//...
const [debouncedValue, setDebouncedValue] = useDebouncedState(value, options)

setDebouncedValue(newValue) // set the debounced value (will be debounced state setter)
//...
```

The [`useDebouncedValue`](../framework/react/examples/useDebouncedValue) hook is useful when your debounced value is derived from an instant value that changes frequently.

```tsx
import { useDebouncedValue } from '@tanstack/react-pacer'
//...
const [instantValue, setInstantValue] = useState(0)
const [debouncedValue] = useDebouncedValue(instantValue, options)
//...
setInstantValue(newValue) // Set the instant value; the debounced value will update automatically, delayed by the wait time
//...
```