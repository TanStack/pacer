---
title: Async Retrying Guide
id: async-retrying
---

Async retrying repeats transiently failing operations with configurable backoff, jitter, timeouts, and cancellation. Choose your environment for safe lifecycle integration.

## Choose your framework

- [Vanilla](../framework/vanilla/guides/async-retrying.md)
- [React](../framework/react/guides/async-retrying.md)
- [Preact](../framework/preact/guides/async-retrying.md)
- [Solid](../framework/solid/guides/async-retrying.md)
- [Angular](../framework/angular/guides/async-retrying.md)

Not sure which operation fits your use case? Start with [Which Pacer Utility Should I Choose?](./which-pacer-utility-should-i-choose.md).

## Retry outcomes inside other async utilities

`AsyncDebouncer`, `AsyncThrottler`, `AsyncRateLimiter`, `AsyncQueuer`, and `AsyncBatcher` use an internal retryer for each execution. Their counters and callbacks distinguish these outcomes:

| Retry outcome | Parent behavior |
| --- | --- |
| Success, including a returned `undefined` | Increment `successCount`, replace `lastResult`, and call `onSuccess`. |
| All attempts fail | Increment `errorCount`, preserve `lastResult`, and call `onError`, even if `asyncRetryerOptions.throwOnError` is `false`. The parent's `throwOnError` controls whether the parent operation rejects. |
| Disabled retryer or aborted execution | Preserve `lastResult` and both success/error counters. Do not call `onSuccess` or `onError`. |

Each execution dispatched by a parent still increments `settleCount` and calls its `onSettled`, including disabled and aborted executions. A call suppressed by the parent's own debounce, throttle, or enabled options is not a dispatched execution.

Queue items and batches are removed when dispatched and are not automatically requeued after cancellation or a disabled retryer. A failed batch adds its items to `failedItems` and `totalItemsFailed`. Disabled and aborted batches increment neither `totalItemsFailed` nor `totalItemsProcessed`.

The standalone `AsyncRetryer.execute()` return and error-handling contract is unchanged. It returns the successful result, or `undefined` for disabled, aborted, and swallowed final failures. Its own `throwOnError` option still controls whether a final failure rejects. For parent utilities, cancellation covers both timeout types and an underlying operation that ignores its signal and settles later. The standalone retryer retains its existing final-attempt timeout rejection behavior.
