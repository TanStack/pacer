import { tracked } from '@glimmer/tracking'
import { TanStackDevtoolsCore } from '@tanstack/devtools'
import { pacerDevtoolsPlugin } from '@tanstack/pacer-devtools'
import {
  isDestroyed,
  isDestroying,
  registerDestructor,
} from '@ember/destroyable'
import { scheduleOnce } from '@ember/runloop'
import Component from '@glimmer/component'
import Example from '../components/Example'
export default class Application extends Component {
  @tracked mounted = true
  toggleMounted = (event: KeyboardEvent) => {
    if (event.shiftKey && event.key === 'Enter') this.mounted = !this.mounted
  }

  constructor(...args: ConstructorParameters<typeof Component>) {
    super(...args)
    document.addEventListener('keydown', this.toggleMounted)
    registerDestructor(this, () =>
      document.removeEventListener('keydown', this.toggleMounted),
    )
    if (import.meta.env.DEV)
      scheduleOnce('afterRender', this, this.mountDevtools)
  }
  private mountDevtools() {
    if (isDestroyed(this) || isDestroying(this)) return
    const target = document.createElement('div')
    document.body.append(target)
    const devtools = new TanStackDevtoolsCore({
      plugins: [pacerDevtoolsPlugin()],
    })
    devtools.mount(target)
    registerDestructor(this, () => {
      devtools.unmount()
      target.remove()
    })
  }
  <template>
    {{#if this.mounted}}<div><Example /></div>{{/if}}
  </template>
}
