import { PacerDevtoolsCore } from './core'

type PanelProps = Parameters<InstanceType<typeof PacerDevtoolsCore>['mount']>[1]

/**
 * Creates a Pacer plugin for the framework-independent TanStack Devtools host.
 * The host supplies the mount element, theme, and open state. Call the host's
 * unmount method when the owning component is destroyed.
 *
 * @example
 * ```ts
 * import { TanStackDevtoolsCore } from '@tanstack/devtools'
 * import { pacerDevtoolsPlugin } from '@tanstack/pacer-devtools'
 *
 * const devtools = new TanStackDevtoolsCore({
 *   plugins: [pacerDevtoolsPlugin()],
 * })
 * devtools.mount(container)
 * // During component cleanup:
 * devtools.unmount()
 * ```
 */
export function pacerDevtoolsPlugin() {
  const panels = new Map<
    HTMLElement,
    {
      core: InstanceType<typeof PacerDevtoolsCore>
      props: PanelProps
    }
  >()
  return {
    name: 'TanStack Pacer',
    render(element: HTMLElement, props: PanelProps) {
      const previous = panels.get(element)
      if (
        previous?.props.theme === props.theme &&
        previous.props.devtoolsOpen === props.devtoolsOpen
      )
        return
      previous?.core.unmount()
      // A new core keeps a cancelled lazy mount separate from its replacement.
      const core = new PacerDevtoolsCore()
      panels.set(element, { core, props: { ...props } })
      void core.mount(element, props)
    },
    destroy() {
      for (const { core } of panels.values()) core.unmount()
      panels.clear()
    },
  }
}

/** The default production export keeps the plugin inert. */
export function pacerDevtoolsNoOpPlugin(): ReturnType<
  typeof pacerDevtoolsPlugin
> {
  return { name: 'TanStack Pacer', render() {}, destroy() {} }
}
