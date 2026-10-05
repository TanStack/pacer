import { flushSync, mount, unmount } from 'svelte'
import Host from './Host.svelte'
export { source } from './source.svelte'
export function setup<T>(create: () => T) {
  const target = document.createElement('div')
  document.body.append(target)
  let result!: T
  const component = mount(Host, {
    target,
    props: {
      setup: () => {
        result = create()
      },
    },
  })
  flushSync()
  return {
    result,
    destroy: () => {
      void unmount(component)
      target.remove()
    },
  }
}
export function flush() {
  flushSync()
}
