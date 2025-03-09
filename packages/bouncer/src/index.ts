export * from './debouncer'
export * from './throttler'

// /**
//  * Throttles a function, ensuring it's called at most once per specified interval.
//  * @param fn The function to throttle
//  * @param interval Minimum time between calls in milliseconds
//  */
// export function throttle<T extends (...args: Array<any>) => any>(
//   fn: T,
//   interval: number,
// ): (...args: Parameters<T>) => void {
//   let lastRun = 0
//   let timeout: NodeJS.Timeout | null = null

//   return function (...args: Parameters<T>) {
//     const now = Date.now()

//     if (lastRun && now < lastRun + interval) {
//       // If the function is being called too soon, schedule it
//       if (timeout) clearTimeout(timeout)
//       timeout = setTimeout(() => {
//         lastRun = now
//         fn(...args)
//       }, interval)
//     } else {
//       lastRun = now
//       fn(...args)
//     }
//   }
// }

// /**
//  * Delays a function execution by a specified amount of time.
//  * @param fn The function to wait
//  * @param wait Delay in milliseconds
//  */
// export function wait<T extends (...args: Array<any>) => any>(
//   fn: T,
//   wait: number,
// ): (...args: Parameters<T>) => Promise<ReturnType<T>> {
//   return (...args: Parameters<T>) =>
//     new Promise((resolve) => {
//       setTimeout(() => resolve(fn(...args)), wait)
//     })
// }

// /**
//  * Schedules a function to run at a specific time.
//  * @param fn The function to schedule
//  * @param date Date when the function should run
//  */
// export function schedule<T extends (...args: Array<any>) => any>(
//   fn: T,
//   date: Date,
// ): (...args: Parameters<T>) => Promise<ReturnType<T>> {
//   return (...args: Parameters<T>) => {
//     const now = new Date()
//     const timeDelay = date.getTime() - now.getTime()
//     return timeDelay > 0
//       ? wait(fn, timeDelay)(...args)
//       : Promise.resolve(fn(...args))
//   }
// }

// /**
//  * Creates a queue for sequential function execution.
//  */
// export class Queue {
//   private queue: Array<() => Promise<any>> = []
//   private processing = false

//   /**
//    * Adds a task to the queue
//    * @param fn Function to be queued
//    */
//   async add<T>(fn: () => Promise<T>): Promise<T> {
//     return new Promise((resolve, reject) => {
//       this.queue.push(async () => {
//         try {
//           const result = await fn()
//           resolve(result)
//         } catch (error) {
//           reject(error)
//         }
//       })
//       this.process()
//     })
//   }

//   private async process(): Promise<void> {
//     if (this.processing) return
//     this.processing = true

//     while (this.queue.length > 0) {
//       const task = this.queue.shift()
//       if (task) await task()
//     }

//     this.processing = false
//   }
// }

// /**
//  * Creates a stack for managing function execution with a maximum size.
//  */
// export class Stack<T> {
//   private items: Array<T> = []

//   constructor(private maxSize: number = Infinity) {}

//   /**
//    * Pushes an item to the stack
//    * @param item Item to push
//    * @returns true if successful, false if stack is full
//    */
//   push(item: T): boolean {
//     if (this.items.length >= this.maxSize) return false
//     this.items.push(item)
//     return true
//   }

//   /**
//    * Removes and returns the top item from the stack
//    */
//   pop(): T | undefined {
//     return this.items.pop()
//   }

//   /**
//    * Returns the number of items in the stack
//    */
//   size(): number {
//     return this.items.length
//   }

//   /**
//    * Checks if the stack is empty
//    */
//   isEmpty(): boolean {
//     return this.items.length === 0
//   }
// }
