import { Provider } from '@angular/core'
import { PACER_OPTIONS } from './pacer-context'
import type { PacerProviderOptions } from './pacer-context'

/**
 * Provides default options for all Pacer utilities in the Angular application.
 * Use this function when configuring your Angular application to set default options
 * that will be used by all Pacer utilities throughout your app.
 *
 * @example
 * ```ts
 * // In your app.config.ts (standalone)
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     providePacerOptions({
 *       debouncer: { wait: 300 },
 *       throttler: { wait: 100 },
 *     }),
 *   ],
 * };
 *
 * // Or in NgModule (module-based)
 * @NgModule({
 *   providers: [
 *     providePacerOptions({
 *       debouncer: { wait: 300 },
 *     }),
 *   ],
 * })
 * export class AppModule {}
 * ```
 */
export function providePacerOptions(options: PacerProviderOptions): Provider {
  return {
    provide: PACER_OPTIONS,
    useValue: options,
  }
}
