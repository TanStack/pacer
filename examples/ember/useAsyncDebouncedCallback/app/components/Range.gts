import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { on } from '@ember/modifier'
import { fn } from '@ember/helper'
import { useAsyncDebouncedCallback } from '@tanstack/ember-pacer'
import { htmlSafe } from '@ember/template'
type Execute = Range['execute']
type Utility = (...args: Parameters<Execute>) => unknown

export default class Range extends Component {
  @tracked email = ''
  @tracked validationResult: {
    isValid: boolean
    message: string
  } | null = null
  @tracked isValidating = false
  validateEmail = async (
    emailAddress: string,
  ): Promise<{
    isValid: boolean
    message: string
  }> => {
    await new Promise((resolve) => setTimeout(resolve, 400))
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const isValid = emailRegex.test(emailAddress)
    return {
      isValid,
      message: isValid
        ? 'Email is valid!'
        : 'Please enter a valid email address',
    }
  }
  handleEmailChange = (utility: Utility, e: Event) => {
    const newEmail = (e.target as HTMLInputElement).value
    this.email = newEmail
    utility(newEmail)
  }
  execute = async (emailAddress: string) => {
    if (!emailAddress.trim()) {
      this.validationResult = null
      return null
    }
    this.isValidating = true
    try {
      const result = await this.validateEmail(emailAddress)
      this.validationResult = result
      return result
    } finally {
      this.isValidating = false
    }
  }
  get inputStyle() {
    const styles = {
      width: '100%',
      marginTop: '5px',
      padding: '8px',
      borderColor:
        this.validationResult?.isValid === false
          ? 'red'
          : this.validationResult?.isValid === true
            ? 'green'
            : 'initial',
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
  get validationStyle() {
    const styles = {
      color: this.validationResult?.isValid ? 'green' : 'red',
      fontWeight: 'bold',
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
      (useAsyncDebouncedCallback this.execute wait=750 leading=false)
      as |debouncedValidateEmail|
    }}<div><h1>TanStack Pacer useAsyncDebouncedCallback Example 3</h1><div
          style='margin-bottom: 20px'
        ><label>Email Address:<input
              type='email'
              value={{this.email}}
              {{on 'input' (fn this.handleEmailChange debouncedValidateEmail)}}
              placeholder='Enter your email...'
              style={{this.inputStyle}}
            /></label></div>{{#if this.isValidating}}<p
            style='color: blue'
          >Validating email...</p>{{/if}}{{#if this.validationResult}}<p
            style={{this.validationStyle}}
          >{{this.validationResult.message}}</p>{{/if}}<p
          style='font-size: 0.9em; color: #666'
        >
          Email validation is debounced to 750ms after you stop typing
        </p></div>{{/let}}
  </template>
}
