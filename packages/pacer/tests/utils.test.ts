import { describe, expect, it } from 'vitest'
import {
  bindInstanceMethods,
  isFunction,
  parseFunctionOrValue,
} from '../src/utils'

describe('isFunction', () => {
  it('should return true for function declarations', () => {
    function testFn() {}
    expect(isFunction(testFn)).toBe(true)
  })

  it('should return true for arrow functions', () => {
    const arrowFn = () => {}
    expect(isFunction(arrowFn)).toBe(true)
  })

  it('should return true for class methods', () => {
    class TestClass {
      method() {}
    }
    expect(isFunction(new TestClass().method)).toBe(true)
  })

  it('should return false for non-function values', () => {
    expect(isFunction(null)).toBe(false)
    expect(isFunction(undefined)).toBe(false)
    expect(isFunction(42)).toBe(false)
    expect(isFunction('string')).toBe(false)
    expect(isFunction({})).toBe(false)
    expect(isFunction([])).toBe(false)
  })
})

describe('parseFunctionValue', () => {
  it('should return the value if it is not a function', () => {
    expect(parseFunctionOrValue(42)).toBe(42)
    expect(parseFunctionOrValue('string')).toBe('string')
    expect(parseFunctionOrValue({ key: 'value' })).toEqual({ key: 'value' })
    expect(parseFunctionOrValue(null)).toBe(null)
    expect(parseFunctionOrValue(undefined)).toBe(undefined)
  })

  it('should execute and return the result if value is a function', () => {
    const fn = () => 42
    expect(parseFunctionOrValue(fn)).toBe(42)
  })

  it('should execute function with arguments if provided', () => {
    const fn = (a: number, b: number) => a + b
    expect(parseFunctionOrValue(() => fn(1, 2))).toBe(3)
  })

  it('should handle async functions', async () => {
    const asyncFn = async () => {
      await new Promise((resolve) => setTimeout(resolve, 100))
      return 42
    }
    expect(await parseFunctionOrValue(asyncFn)).toBe(42)
  })
})

describe('bindInstanceMethods', () => {
  it('should bind all instance methods', () => {
    class TestClass {
      value = 42
      method1() {
        return this.value
      }
      method2() {
        return this.value * 2
      }
    }

    const instance = new TestClass()
    const bound = bindInstanceMethods(instance)

    // Test that methods are bound by calling them without the instance context
    const { method1, method2 } = bound
    expect(method1()).toBe(42)
    expect(method2()).toBe(84)
  })

  it('should not bind non-method properties', () => {
    class TestClass {
      value = 42
      method() {
        return this.value
      }
    }

    const instance = new TestClass()
    const bound = bindInstanceMethods(instance)

    expect(bound.value).toBe(42)
    expect(bound.method()).toBe(42)
  })

  it('should work with inheritance', () => {
    class Parent {
      parentMethod() {
        return 'parent'
      }
    }

    class Child extends Parent {
      childMethod() {
        return 'child'
      }
    }

    const instance = new Child()
    const bound = bindInstanceMethods(instance)

    const { parentMethod, childMethod } = bound
    expect(parentMethod()).toBe('parent')
    expect(childMethod()).toBe('child')
  })
})
