---
id: PacerEventName
title: PacerEventName
---

# Type Alias: PacerEventName

```ts
type PacerEventName = keyof PacerEventMap extends `pacer:${infer T}` ? T : never;
```

Defined in: [event-client.ts:39](https://github.com/theVedanta/pacer/blob/main/packages/pacer/src/event-client.ts#L39)
