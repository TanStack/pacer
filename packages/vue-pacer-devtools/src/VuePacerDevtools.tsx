import { defineComponent, h, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { PacerDevtoolsCore } from '@tanstack/pacer-devtools/production'
import type { DefineComponent, PropType } from 'vue'
import type { DevtoolsPanelProps } from '@tanstack/devtools-utils/vue'

export interface PacerDevtoolsVueInit extends Partial<DevtoolsPanelProps> {}

/** A standalone Vue panel. The plugin supplies the same theme and open-state props. */
export const PacerDevtoolsPanel: DefineComponent<PacerDevtoolsVueInit> =
  defineComponent({
    name: 'PacerDevtoolsPanel',
    props: {
      theme: {
        type: String as PropType<DevtoolsPanelProps['theme']>,
        default: 'dark',
      },
      devtoolsOpen: { type: Boolean, default: true },
    },
    setup(props) {
      const target = ref<HTMLElement>()
      let core: InstanceType<typeof PacerDevtoolsCore> | undefined
      const mount = () => {
        if (target.value && core)
          core.mount(target.value, {
            theme: props.theme ?? 'dark',
            devtoolsOpen: props.devtoolsOpen ?? true,
          })
      }
      onMounted(() => {
        core = new PacerDevtoolsCore()
        mount()
      })
      // The framework-independent panel owns its own reactive tree. Remount to
      // apply host prop changes without relying on Vue tracking inside Solid.
      watch(
        () => [props.theme, props.devtoolsOpen],
        () => {
          core?.unmount()
          mount()
        },
      )
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
