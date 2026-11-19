import { shallow, useSelector } from '@tanstack/solid-store'
import { createMemo, createRenderEffect, onCleanup } from 'solid-js'
import type { Store } from '@tanstack/solid-store'
import type { Accessor, Element } from 'solid-js'

interface PacerInstance<TOptions> {
  store: Store<any>
  options: object
  setOptions: (options: TOptions) => void
}

/**
 * Builds a pacer utility for Solid and returns its Solid-facing object.
 *
 * The instance is built in a memo, so it waits under `Loading` while an
 * option is still loading, instead of throwing. Once built, the returned
 * object forwards to it directly, so reads and destructuring in a component
 * body stay plain. Option changes after that reach the instance through
 * `setOptions`.
 */
export function createPacer<
  TOptions,
  TInstance extends PacerInstance<TOptions>,
>(
  build: (options: TOptions) => TInstance,
  options: Accessor<TOptions>,
  selector: (state: any) => unknown,
  stop?: (instance: TInstance) => void,
): any {
  let built: TInstance | undefined
  const instance = createMemo(() => built ?? (built = build(options())))
  const current = () => built ?? instance()

  createRenderEffect(
    () => [current(), options()] as const,
    ([instance, latest]) => instance.setOptions(latest),
  )

  // The selection subscribes to the store once the instance exists.
  const select = <T>(select: (state: any) => T): Accessor<T> => {
    const selection = createMemo(() =>
      useSelector(current().store, select, { compare: shallow }),
    )
    return () => selection()()
  }

  const extras = {
    state: select(selector),
    Subscribe: (props: {
      selector: (state: any) => unknown
      children: ((state: Accessor<unknown>) => Element) | Element
    }) =>
      typeof props.children === 'function'
        ? props.children(select((state) => props.selector(state)))
        : props.children,
  }

  const result: object = new Proxy(extras, {
    // Solid checks whether a computed value is a promise or an async iterable
    // with an untracked read, which gives no instance while it is pending.
    get: (target, key) => {
      if (key in target) return target[key as keyof typeof extras]
      const instance = current() as object | undefined
      return instance && Reflect.get(instance, key)
    },
    set: (target, key, value) =>
      Reflect.set(key in target ? target : current(), key, value),
    has: (target, key) => key in target || key in current(),
    ownKeys: (target) => [
      ...new Set([...Reflect.ownKeys(current()), ...Reflect.ownKeys(target)]),
    ],
    getOwnPropertyDescriptor: (target, key) => {
      const descriptor = Reflect.getOwnPropertyDescriptor(
        key in target ? target : current(),
        key,
      )
      if (descriptor) descriptor.configurable = true
      return descriptor
    },
  })

  onCleanup(() => {
    if (!built) return
    const { onUnmount } = built.options as {
      onUnmount?: (result: object) => void
    }
    if (onUnmount) onUnmount(result)
    else stop?.(built)
  })

  return result
}
