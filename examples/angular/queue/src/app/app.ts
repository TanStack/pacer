import { Component, signal } from '@angular/core'
import { queue } from '@tanstack/angular-pacer'

@Component({ selector: 'app-root', templateUrl: './app.html' })
export class App {
  readonly source = signal('')
  readonly currentValue = signal(50)
  readonly rangeValue = signal(50)
  readonly instantExecutions = signal(0)
  readonly numberItems = signal<Array<number>>([])
  readonly textItems = signal<Array<string>>([])
  readonly rangeItems = signal<Array<number>>([])
  readonly numberProcessed = signal(0)
  readonly textProcessed = signal(0)
  readonly rangeProcessed = signal(0)
  readonly queuedText = signal('')
  private readonly numberRunner = queue<number>(
    (item) => {
      console.log('Processed', item)
    },
    {
      maxSize: 25,
      wait: 1000,
      onItemsChange: (queuer) => this.numberItems.set(queuer.peekAllItems()),
      onExecute: (_item, queuer) => this.numberProcessed.set(queuer.store.state.executionCount),
    },
  )
  private readonly textRunner = queue<string>(
    (item) => {
      this.queuedText.set(item)
    },
    {
      maxSize: 100,
      wait: 500,
      onItemsChange: (queuer) => this.textItems.set(queuer.peekAllItems()),
      onExecute: (_item, queuer) => this.textProcessed.set(queuer.store.state.executionCount),
    },
  )
  private readonly rangeRunner = queue<number>(
    (item) => {
      this.rangeValue.set(item)
    },
    {
      maxSize: 100,
      wait: 100,
      onItemsChange: (queuer) => this.rangeItems.set(queuer.peekAllItems()),
      onExecute: (_item, queuer) => this.rangeProcessed.set(queuer.store.state.executionCount),
    },
  )
  addNumber(): void {
    const items = this.numberItems()
    this.numberRunner(items.length ? items[items.length - 1]! + 1 : 1)
  }
  onSearch(value: string): void {
    this.source.set(value)
    this.textRunner(value)
  }
  onRange(value: number): void {
    this.currentValue.set(value)
    this.instantExecutions.update((count) => count + 1)
    this.rangeRunner(value)
  }
}
