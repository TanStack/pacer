import Helper from '@ember/component/helper'
import { isDestroyed, isDestroying } from '@ember/destroyable'
import { scheduleOnce } from '@ember/runloop'
import { fetchPost, queryClient } from '../api'

/** Prefetch a committed Pacer value after rendering, without changing template state. */
class Prefetch extends Helper<{
  Args: { Positional: [id: number | null] }
  Return: null
}> {
  private latest: number | null = null
  private previous: number | null = null
  compute([id]: [number | null]) {
    this.latest = id
    scheduleOnce('afterRender', this, this.update)
    return null
  }
  private update() {
    if (
      isDestroyed(this) ||
      isDestroying(this) ||
      this.latest === this.previous
    )
      return
    const id = this.latest
    this.previous = id
    if (id)
      void queryClient.ensureQueryData({
        queryKey: ['post', id],
        queryFn: () => fetchPost(id),
      })
  }
}
export { Prefetch as prefetch }
