---
id: emitChange
title: emitChange
---

```ts
function emitChange<TEvent>(event, instance): void;
```

Defined in: [event-client.ts:104](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/event-client.ts#L104)

Devtools only run in development, matching `@tanstack/devtools-event-client`.
Production bundlers fold this check, so the devtools registry, payload
cloning and the event client are tree-shaken out.

## Type Parameters

### TEvent

`TEvent` *extends* keyof [`PacerEventMap`](../interfaces/PacerEventMap.md)

## Parameters

### event

`TEvent`

### instance

`PacerUtilEmitSource`

## Returns

`void`
