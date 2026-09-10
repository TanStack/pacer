---
id: PacerDevtoolsWirePayload
title: PacerDevtoolsWirePayload
---

# Interface: PacerDevtoolsWirePayload

Defined in: [event-client.ts:10](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/event-client.ts#L10)

Payload on the devtools event bus must be JSON-serializable: `ClientEventBus`
always stringifies events for `emitToServer` and `BroadcastChannel`, so live
util instances (with reactive `store` graphs) cannot be sent as-is.

Live instances are kept in pacerDevtoolsInstancesByKey for the panel.

## Properties

### key

```ts
key: string;
```

Defined in: [event-client.ts:11](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/event-client.ts#L11)

***

### options

```ts
options: unknown;
```

Defined in: [event-client.ts:13](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/event-client.ts#L13)

***

### store

```ts
store: object;
```

Defined in: [event-client.ts:12](https://github.com/TanStack/pacer/blob/main/packages/pacer/src/event-client.ts#L12)

#### state

```ts
state: unknown;
```
