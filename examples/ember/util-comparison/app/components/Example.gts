import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { on } from '@ember/modifier'
import { fn } from '@ember/helper'
import { htmlSafe } from '@ember/template'
import {
  useDebouncer,
  useThrottler,
  useRateLimiter,
  useQueuer,
  useBatcher,
} from '@tanstack/ember-pacer'
import type {
  EmberDebouncer,
  EmberThrottler,
  EmberRateLimiter,
  EmberQueuer,
  EmberBatcher,
  DebouncerState,
  ThrottlerState,
  RateLimiterState,
  QueuerState,
  BatcherState,
} from '@tanstack/ember-pacer'
type NumberCallback = (value: number) => void
interface ComparisonState {
  executionCount: number
  status: string
  rejectionCount?: number
  size?: number
  totalItemsProcessed?: number
}
interface Utilities {
  debouncer: EmberDebouncer<NumberCallback, DebouncerState<NumberCallback>>
  throttler: EmberThrottler<NumberCallback, ThrottlerState<NumberCallback>>
  rateLimiter: EmberRateLimiter<NumberCallback, RateLimiterState>
  queuer: EmberQueuer<number, QueuerState<number>>
  batcher: EmberBatcher<number, BatcherState<number>>
}
type Card = ReturnType<Example['utilityMetadata']>[number]
const collect = (
  debouncer: Utilities['debouncer'],
  throttler: Utilities['throttler'],
  rateLimiter: Utilities['rateLimiter'],
  queuer: Utilities['queuer'],
  batcher: Utilities['batcher'],
) => ({ debouncer, throttler, rateLimiter, queuer, batcher })
const space = ' '
const eq = (a: unknown, b: unknown) => a === b
const sub = (a: number, b: number) => a - b
const divide = (a: number, b: number) => a / b
const multiply = (a: number, b: number) => a * b
const round = (value: number) => Math.round(value)
const json = (value: unknown) => JSON.stringify(value, null, 2)
export default class Example extends Component {
  updateDebouncer = (value: typeof this.debouncedValue) => {
    this.debouncedValue = value
  }
  selectDebouncer = (state: DebouncerState<NumberCallback>) => state
  updateThrottler = (value: typeof this.throttledValue) => {
    this.throttledValue = value
  }
  selectThrottler = (state: ThrottlerState<NumberCallback>) => state
  updateRateLimiter = (value: typeof this.rateLimitedValue) => {
    this.rateLimitedValue = value
  }
  selectRateLimiter = (state: RateLimiterState) => state
  updateQueuer = (value: typeof this.queuedValue) => {
    this.queuedValue = value
  }
  selectQueuer = (state: QueuerState<number>) => state
  updateBatcher = (items: Array<number>) => {
    // Use the last item in the batch as the displayed value
    if (items.length > 0) {
      this.batchedValue = items[items.length - 1]!
    }
  }
  selectBatcher = (state: BatcherState<number>) => state
  explainReadonly = () => {
    window.alert('These sliders are read-only. Move the main slider at the top')
  }
  @tracked currentValue = 50
  @tracked instantExecutionCount = 0
  @tracked debouncedValue = 50
  @tracked throttledValue = 50
  @tracked rateLimitedValue = 50
  @tracked queuedValue = 50
  @tracked batchedValue = 50
  handleRangeChange = (utilities: Utilities, e: Event) => {
    const newValue = parseInt((e.target as HTMLInputElement).value, 10)
    this.currentValue = newValue
    this.instantExecutionCount = this.instantExecutionCount + 1
    // Trigger each utility
    utilities.debouncer.maybeExecute(newValue)
    utilities.throttler.maybeExecute(newValue)
    utilities.rateLimiter.maybeExecute(newValue)
    utilities.queuer.addItem(newValue)
    utilities.batcher.addItem(newValue)
  }
  getSyncStatus = (
    processedValue: number,
    utilityName: string,
    utilityState?: {
      status: string
    },
  ) => {
    const isOutOfSync = processedValue !== this.currentValue
    const isPending =
      (utilityName === 'Debouncer' && utilityState?.status === 'pending') ||
      (utilityName === 'Throttler' && utilityState?.status === 'pending') ||
      (utilityName === 'Queuer' && utilityState?.status === 'running') ||
      (utilityName === 'Batcher' && utilityState?.status === 'pending')
    // Tooltip explanations for why certain utilities become out of sync
    const getTooltip = () => {
      if (!isOutOfSync) return undefined
      switch (utilityName) {
        case 'Rate Limiter':
          return isPending
            ? 'Rate limiter is processing within limits'
            : 'Rate limiters reject executions when the limit is exceeded. Rejected calls are discarded entirely and never processed, causing the value to lag behind rapid changes.'
        case 'Queuer':
          return isPending
            ? 'Queuer is processing items from the queue'
            : 'Queuers reject new items when their buffer is full. If items are added faster than they can be processed, the buffer overflows and newer items are dropped.'
        default:
          return undefined
      }
    }
    return {
      isOutOfSync,
      isPending,
      statusText: isOutOfSync
        ? isPending
          ? 'Processing...'
          : 'Out of sync'
        : 'Synced',
      tooltip: getTooltip(),
    }
  }
  utilityMetadata = (utilities: Utilities) => {
    return (
      [
        {
          name: 'Debouncer',
          value: this.debouncedValue,
          description: `Delays execution until after ${utilities.debouncer.options.wait}ms of inactivity`,
          color: '#3b82f6', // blue
          flush: () => utilities.debouncer.flush(),
          util: utilities.debouncer,
        },
        {
          name: 'Throttler',
          value: this.throttledValue,
          description: `Limits execution to once every ${utilities.throttler.options.wait}ms`,
          color: '#0891b2', // cyan
          flush: () => utilities.throttler.flush(),
          util: utilities.throttler,
        },
        {
          name: 'Rate Limiter',
          value: this.rateLimitedValue,
          description: `Allows max ${utilities.rateLimiter.options.limit} executions per ${utilities.rateLimiter.options.window}ms window`,
          color: '#ea580c', // orange
          util: utilities.rateLimiter,
        },
        {
          name: 'Queuer',
          value: this.queuedValue,
          description: `Processes items sequentially with ${utilities.queuer.options.wait}ms delay`,
          color: '#db2777', // pink
          flush: () => utilities.queuer.flush(),
          util: utilities.queuer,
        },
        {
          name: 'Batcher',
          value: this.batchedValue,
          description: `Processes in batches of ${utilities.batcher.options.maxSize} or after ${utilities.batcher.options.wait}ms`,
          color: '#8b5cf6', // purple
          flush: () => utilities.batcher.flush(),
          util: utilities.batcher,
        },
      ] as const
    ).map((utility) => ({
      ...utility,
      state: utility.util.state as ComparisonState,
      syncStatus: this.getSyncStatus(
        utility.value,
        utility.name,
        utility.util.state,
      ),
      flush: 'flush' in utility ? utility.flush : undefined,
    }))
  }
  cardStyle = (utility: Card) => {
    const styles = {
      border: `2px solid ${utility.color}`,
      borderRadius: '6px',
      padding: '10px',
      backgroundColor: utility.syncStatus.isPending
        ? 'rgba(254, 249, 195, 0.4)' // yellowish if pending
        : utility.syncStatus.isOutOfSync
          ? 'rgba(254, 226, 226, 0.4)' // reddish if out of sync
          : 'rgba(209, 250, 229, 0.4)', // greenish if synced
      transition: 'background-color 0.2s ease',
    }
    return htmlSafe(
      Object.entries(styles)
        .map(
          ([property, value]) =>
            property.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase()) +
            ': ' +
            value,
        )
        .join('; '),
    )
  }
  headingStyle = (utility: Card) => {
    const styles = {
      color: utility.color,
      margin: '0 0 8px 0',
      fontSize: '1.1em',
    }
    return htmlSafe(
      Object.entries(styles)
        .map(
          ([property, value]) =>
            property.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase()) +
            ': ' +
            value,
        )
        .join('; '),
    )
  }
  warningStyle = (utility: Card) => {
    const styles = {
      display: 'flex',
      alignItems: 'center',
      gap: '3px',
      color: utility.syncStatus.isPending ? '#f59e0b' : '#ef4444',
      fontSize: '0.8em',
      cursor: utility.syncStatus.tooltip ? 'help' : 'default',
    }
    return htmlSafe(
      Object.entries(styles)
        .map(
          ([property, value]) =>
            property.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase()) +
            ': ' +
            value,
        )
        .join('; '),
    )
  }
  sliderStyle = (utility: Card) => {
    const styles = {
      width: '100%',
      margin: '2px 0',
      accentColor: utility.color,
    }
    return htmlSafe(
      Object.entries(styles)
        .map(
          ([property, value]) =>
            property.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase()) +
            ': ' +
            value,
        )
        .join('; '),
    )
  }
  flushStyle = (utility: Card) => {
    const styles = {
      backgroundColor: utility.color,
      color: 'white',
      border: 'none',
      padding: '6px 12px',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '0.85em',
      width: '100%',
    }
    return htmlSafe(
      Object.entries(styles)
        .map(
          ([property, value]) =>
            property.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase()) +
            ': ' +
            value,
        )
        .join('; '),
    )
  }
  stateHeadingStyle = (utility: Card) => {
    const styles = {
      color: utility.color,
      margin: '0 0 5px 0',
      fontSize: '0.9em',
    }
    return htmlSafe(
      Object.entries(styles)
        .map(
          ([property, value]) =>
            property.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase()) +
            ': ' +
            value,
        )
        .join('; '),
    )
  }
  <template>
    {{#let
      (useDebouncer
        this.updateDebouncer this.selectDebouncer key='my-debouncer' wait=600
      )
      (useThrottler
        this.updateThrottler this.selectThrottler key='my-throttler' wait=600
      )
      (useRateLimiter
        this.updateRateLimiter
        this.selectRateLimiter
        key='my-rate-limiter'
        limit=20
        window=2000
        windowType='sliding'
      )
      (useQueuer
        this.updateQueuer this.selectQueuer key='my-queuer' wait=100 maxSize=50
      )
      (useBatcher
        this.updateBatcher
        this.selectBatcher
        key='my-batcher'
        wait=600
        maxSize=5
      )
      as |debouncer throttler rateLimiter queuer batcher|
    }}{{#let
        (collect debouncer throttler rateLimiter queuer batcher)
        as |utilities|
      }}<div
          style='padding: 12px; font-family: system-ui, sans-serif; max-width: 100%'
        ><h1 style='font-size: 1.5em; margin-bottom: 15px'>
            TanStack Pacer Utilities Comparison
          </h1><div style='margin-bottom: 20px'><h2
              style='font-size: 1.2em; margin-bottom: 10px'
            >
              Instant Slider (Move this slider to see the utilities in action)
            </h2><div style='margin-bottom: 15px'><label><strong>Current Value:
                  {{this.currentValue}}</strong><input
                  max='100'
                  min='0'
                  {{on 'input' (fn this.handleRangeChange utilities)}}
                  style='width: 100%; margin: 8px 0'
                  type='range'
                  value={{this.currentValue}}
                /></label></div><div style='margin-bottom: 15px'><strong>Total
                Interactions:</strong>{{space}}{{this.instantExecutionCount}}</div></div><div
            style='display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px; margin-bottom: 30px'
          >{{#each (this.utilityMetadata utilities) as |utility index|}}<div
                style={{this.cardStyle utility}}
              ><h3 style={{this.headingStyle utility}}>{{utility.name}}</h3><p
                  style='font-size: 0.85em; color: #666; margin: 0 0 12px 0; line-height: 1.4'
                >{{utility.description}}</p><div
                  style='margin-bottom: 12px'
                ><div style='margin-bottom: 4px'><strong
                      style='font-size: 0.9em'
                    >Value: {{utility.value}}</strong></div><div
                    style='margin-bottom: 6px'
                  >{{#if utility.syncStatus.isOutOfSync}}<span
                        style={{this.warningStyle utility}}
                        title={{utility.syncStatus.tooltip}}
                      >
                        <svg
                          width='12'
                          height='12'
                          viewBox='0 0 24 24'
                          fill='none'
                          stroke='currentColor'
                          stroke-width='2'
                          style='display: inline-block; vertical-align: middle'
                        >
                          <path
                            d='M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z'
                          />
                          <line x1='12' y1='9' x2='12' y2='13' />
                          <line x1='12' y1='17' x2='12.01' y2='17' />
                        </svg>
                        {{utility.syncStatus.statusText}}</span>{{else}}<span
                        style='display: flex; align-items: center; gap: 3px; color: #10b981; font-size: 0.8em'
                      >
                        <svg
                          width='12'
                          height='12'
                          viewBox='0 0 24 24'
                          fill='none'
                          stroke='currentColor'
                          stroke-width='2'
                          style='display: inline-block; vertical-align: middle'
                        >
                          <path d='M22 11.08V12a10 10 0 1 1-5.93-9.14' />
                          <polyline points='22,4 12,14.01 9,11.01' />
                        </svg>
                        {{utility.syncStatus.statusText}}</span>{{/if}}</div><input
                    {{on 'click' this.explainReadonly}}
                    type='range'
                    min='0'
                    max='100'
                    value={{utility.value}}
                    disabled
                    style={{this.sliderStyle utility}}
                  /></div><div
                  style='font-size: 0.8em; margin-bottom: 12px; line-height: 1.3'
                ><div><strong
                    >Executions:</strong>{{space}}{{utility.state.executionCount}}</div><div
                  ><strong>Reduction:</strong>{{space}}{{#if
                      (eq this.instantExecutionCount 0)
                    }}0{{else}}{{round
                        (multiply
                          (divide
                            (sub
                              this.instantExecutionCount
                              utility.state.executionCount
                            )
                            this.instantExecutionCount
                          )
                          100
                        )
                      }}{{/if}}%
                  </div>{{#if (eq utility.name 'Rate Limiter')}}<div><strong
                      >Rejections:</strong>{{space}}{{utility.state.rejectionCount}}</div>{{/if}}{{#if
                    (eq utility.name 'Queuer')
                  }}<div><strong>Queue Size:</strong>{{space}}{{utility.state.size}}</div>{{/if}}{{#if
                    (eq utility.name 'Batcher')
                  }}<div><strong>Batch Size:</strong>{{space}}{{utility.state.size}}</div><div
                    ><strong>Items Processed:</strong>{{space}}{{utility.state.totalItemsProcessed}}</div>{{/if}}<div
                  ><strong
                    >Status:</strong>{{space}}{{utility.state.status}}</div></div>{{#if
                  utility.flush
                }}<button
                    {{on 'click' utility.flush}}
                    style={{this.flushStyle utility}}
                  > Flush </button>{{/if}}</div>{{/each}}</div><div
            style='margin-top: 20px'
          ><h2 style='font-size: 1.2em; margin-bottom: 10px'>
              Detailed States
            </h2><div
              style='display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 8px'
            >{{#each (this.utilityMetadata utilities) as |utility index|}}<div
                ><h4 style={{this.stateHeadingStyle utility}}>{{utility.name}}
                    State
                  </h4><pre
                    style='font-size: 0.7em; background-color: #f5f5f5; padding: 8px; border-radius: 4px; overflow: auto; max-height: 500px; margin: 0'
                  >{{json
                      utility.state
                    }}</pre></div>{{/each}}</div></div></div>{{/let}}{{/let}}
  </template>
}
