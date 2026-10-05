import {
  computed,
  defineComponent,
  h,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from 'vue'
import { PacerDevtoolsCore } from '@tanstack/pacer-devtools/production'
import type { DefineComponent, PropType } from 'vue'
import type { DevtoolsPanelProps } from '@tanstack/devtools-utils/vue'

export interface PacerDevtoolsVueInit extends Partial<
  Omit<DevtoolsPanelProps, 'theme'>
> {
  /** Theme, or the host payload supplied by @tanstack/vue-devtools 0.2. */
  theme?: DevtoolsPanelProps['theme'] | DevtoolsPanelProps
}

/** A standalone Vue panel. The plugin supplies the same theme and open-state props. */
export const PacerDevtoolsPanel: DefineComponent<PacerDevtoolsVueInit> =
  defineComponent({
    name: 'PacerDevtoolsPanel',
    props: {
      theme: {
        type: [String, Object] as PropType<PacerDevtoolsVueInit['theme']>,
        default: 'dark',
      },
      devtoolsOpen: { type: Boolean, default: undefined },
    },
    setup(props) {
      const target = ref<HTMLElement>()
      const panelProps = computed<DevtoolsPanelProps>(() => {
        // Vue host 0.2 forwards the core's entire second render argument as
        // `theme`. Accept that payload as well as the normal flat panel props.
        const host = typeof props.theme === 'object' ? props.theme : undefined
        return {
          theme:
            host?.theme ??
            (typeof props.theme === 'string' ? props.theme : 'dark'),
          devtoolsOpen: props.devtoolsOpen ?? host?.devtoolsOpen ?? true,
        }
      })
      let core: InstanceType<typeof PacerDevtoolsCore> | undefined
      const mount = () => {
        if (target.value) {
          core = new PacerDevtoolsCore()
          core.mount(target.value, panelProps.value)
        }
      }
      onMounted(() => {
        mount()
      })
      // The framework-independent panel owns its own reactive tree. Remount to
      // apply host prop changes without relying on Vue tracking inside Solid.
      watch(panelProps, () => {
        core?.unmount()
        mount()
      })
      onBeforeUnmount(() => {
        core?.unmount()
        core = undefined
      })
      return () => h('div', { ref: target, style: { height: '100%' } })
    },
  })

export const PacerDevtoolsPanelNoOp: DefineComponent<PacerDevtoolsVueInit> =
  defineComponent({
    name: 'PacerDevtoolsPanelNoOp',
    props: PacerDevtoolsPanel.props,
    setup: () => () => null,
  })
