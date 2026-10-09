import { isDevMode } from '@angular/core'
import { provideTanStackDevtools } from '@tanstack/angular-devtools/provider'
import { pacerDevtoolsPlugin } from '@tanstack/angular-pacer-devtools'
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core'
import { provideRouter } from '@angular/router'

import { routes } from './app.routes'

export const appConfig: ApplicationConfig = {
  providers: [
    ...(isDevMode() ? [provideTanStackDevtools(() => ({ plugins: [pacerDevtoolsPlugin()] }))] : []),
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
  ],
}
