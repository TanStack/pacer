---
id: providePacerOptions
title: providePacerOptions
---

# Function: providePacerOptions()

```ts
function providePacerOptions(options): Provider;
```

Defined in: [provider/pacer-provider.ts:33](https://github.com/theVedanta/pacer/blob/main/packages/angular-pacer/src/provider/pacer-provider.ts#L33)

Provides default options for all Pacer utilities in the Angular application.
Use this function when configuring your Angular application to set default options
that will be used by all Pacer utilities throughout your app.

## Parameters

### options

`PacerProviderOptions`

## Returns

`Provider`

## Example

```ts
// In your app.config.ts (standalone)
export const appConfig: ApplicationConfig = {
  providers: [
    providePacerOptions({
      debouncer: { wait: 300 },
      throttler: { wait: 100 },
    }),
  ],
};

// Or in NgModule (module-based)
@NgModule({
  providers: [
    providePacerOptions({
      debouncer: { wait: 300 },
    }),
  ],
})
export class AppModule {}
```
