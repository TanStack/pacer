import { Component, signal } from '@angular/core'
import { RouterOutlet } from '@angular/router'
import { asyncRetry } from '@tanstack/angular-pacer'

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly failTimes = signal(2)
  protected readonly runId = signal(0)

  protected readonly status = signal<'idle' | 'running' | 'success' | 'error'>('idle')
  protected readonly attempt = signal(0)
  protected readonly result = signal<string | null>(null)
  protected readonly error = signal<string | null>(null)

  protected readonly log = signal<Array<{ time: string; message: string }>>([])

  private logLine(message: string) {
    this.log.update((l) => [{ time: new Date().toLocaleTimeString(), message }, ...l].slice(0, 50))
  }

  protected setFailTimes(value: number) {
    this.failTimes.set(value)
  }

  protected bumpRunId() {
    this.runId.update((v) => v + 1)
  }

  protected reset() {
    this.status.set('idle')
    this.attempt.set(0)
    this.result.set(null)
    this.error.set(null)
    this.log.set([])
  }

  @asyncRetry((ctx) => ({
    key: `asyncRetry-example-${ctx.args[0]}`,
    enabled: true,
    maxAttempts: 5,
    baseWait: 250,
    backoff: 'exponential',
    jitter: true,
    throwOnError: false,
  }))
  protected async run(runId: number): Promise<string | undefined> {
    this.status.set('running')
    this.result.set(null)
    this.error.set(null)

    const attempt = this.attempt() + 1
    this.attempt.set(attempt)
    this.logLine(`attempt ${attempt} (runId=${runId})`)

    await new Promise((r) => setTimeout(r, 250))

    if (attempt <= this.failTimes()) {
      const msg = `simulated failure on attempt ${attempt}`
      this.error.set(msg)
      this.logLine(msg)
      throw new Error(msg)
    }

    const value = `success on attempt ${attempt}`
    this.result.set(value)
    this.status.set('success')
    this.logLine(value)
    return value
  }

  protected async start() {
    this.reset()
    this.bumpRunId()
    const id = this.runId()
    const value = await this.run(id)
    if (value === undefined) {
      this.status.set('error')
      this.logLine('gave up (maxAttempts reached)')
    }
  }
}
