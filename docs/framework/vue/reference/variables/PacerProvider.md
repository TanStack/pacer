---
id: PacerProvider
title: PacerProvider
---

```ts
const PacerProvider: DefineComponent<ExtractPropTypes<{
  defaultOptions: {
     default: () => object;
     type: PropType<PacerProviderOptions>;
  };
}>, () =>
  | VNode<RendererNode, RendererElement, {
[key: string]: any;
}>[]
  | undefined, {
}, {
}, {
}, ComponentOptionsMixin, ComponentOptionsMixin, {
}, string, PublicProps, ToResolvedProps<ExtractPropTypes<{
  defaultOptions: {
     default: () => object;
     type: PropType<PacerProviderOptions>;
  };
}>, {
}>, {
  defaultOptions: PacerProviderOptions;
}, {
}, {
}, {
}, string, ComponentProvideOptions, true, {
}, any>;
```

Defined in: [provider/PacerProvider.ts:36](https://github.com/TanStack/pacer/blob/main/packages/vue-pacer/src/provider/PacerProvider.ts#L36)

Provides reactive defaults to descendant components. Local options take precedence.
